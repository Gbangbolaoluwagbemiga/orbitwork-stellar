#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, IntoVal, Symbol, Val, Vec,
};

#[contracttype]
pub enum EscrowKey {
    Registry,
    Deposit(u64),
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowDeposit {
    pub order_id: u64,
    pub client: Address,
    pub amount: i128,
    pub released: bool,
    pub refunded: bool,
}

#[contract]
pub struct OrbitEscrow;

#[contractimpl]
impl OrbitEscrow {
    /// Store the OrbitRegistry contract address that this escrow will call.
    pub fn initialize(env: Env, registry_id: Address) {
        env.storage().instance().set(&EscrowKey::Registry, &registry_id);
        env.storage().instance().extend_ttl(100, 200);
    }

    /// Record an escrow deposit intent for a given work order.
    pub fn fund_order(env: Env, client: Address, order_id: u64, amount: i128) {
        client.require_auth();
        assert!(amount > 0, "amount must be positive");

        let deposit = EscrowDeposit {
            order_id,
            client,
            amount,
            released: false,
            refunded: false,
        };

        env.storage()
            .persistent()
            .set(&EscrowKey::Deposit(order_id), &deposit);
        env.storage()
            .persistent()
            .extend_ttl(&EscrowKey::Deposit(order_id), 100, 200);
        env.storage().instance().extend_ttl(100, 200);

        env.events()
            .publish((symbol_short!("funded"),), (order_id, amount));
    }

    /// Release escrow — marks deposit released and calls OrbitRegistry.update_status(1).
    ///
    /// This is the inter-contract call: OrbitEscrow → OrbitRegistry.
    /// The client's auth (from the top-level transaction) propagates through
    /// the sub-invocation so require_auth() inside update_status is satisfied.
    pub fn release_payment(env: Env, client: Address, order_id: u64) {
        client.require_auth();

        let mut deposit: EscrowDeposit = env
            .storage()
            .persistent()
            .get(&EscrowKey::Deposit(order_id))
            .expect("deposit not found");

        assert!(!deposit.released, "already released");
        assert!(!deposit.refunded, "already refunded");
        assert!(deposit.client == client, "not the depositor");

        deposit.released = true;
        env.storage()
            .persistent()
            .set(&EscrowKey::Deposit(order_id), &deposit);
        env.storage()
            .persistent()
            .extend_ttl(&EscrowKey::Deposit(order_id), 100, 200);

        // ── Inter-contract call: OrbitRegistry.update_status(order_id, 1) ──
        let registry_id: Address = env
            .storage()
            .instance()
            .get(&EscrowKey::Registry)
            .expect("registry not initialized");

        let args: Vec<Val> = (order_id, 1u32).into_val(&env);
        env.invoke_contract::<bool>(
            &registry_id,
            &Symbol::new(&env, "update_status"),
            args,
        );

        env.events()
            .publish((symbol_short!("released"),), (order_id, deposit.amount));
    }

    /// Refund escrow — marks deposit refunded and calls OrbitRegistry.update_status(2).
    pub fn refund(env: Env, client: Address, order_id: u64) {
        client.require_auth();

        let mut deposit: EscrowDeposit = env
            .storage()
            .persistent()
            .get(&EscrowKey::Deposit(order_id))
            .expect("deposit not found");

        assert!(!deposit.released, "already released");
        assert!(!deposit.refunded, "already refunded");
        assert!(deposit.client == client, "not the depositor");

        deposit.refunded = true;
        env.storage()
            .persistent()
            .set(&EscrowKey::Deposit(order_id), &deposit);
        env.storage()
            .persistent()
            .extend_ttl(&EscrowKey::Deposit(order_id), 100, 200);

        // ── Inter-contract call: OrbitRegistry.update_status(order_id, 2) ──
        let registry_id: Address = env
            .storage()
            .instance()
            .get(&EscrowKey::Registry)
            .expect("registry not initialized");

        let args: Vec<Val> = (order_id, 2u32).into_val(&env);
        env.invoke_contract::<bool>(
            &registry_id,
            &Symbol::new(&env, "update_status"),
            args,
        );

        env.events()
            .publish((symbol_short!("refunded"),), (order_id, deposit.amount));
    }

    pub fn get_deposit(env: Env, order_id: u64) -> Option<EscrowDeposit> {
        env.storage().persistent().get(&EscrowKey::Deposit(order_id))
    }
}

// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
extern crate std;

#[cfg(test)]
mod test {
    use super::*;
    use orbit_registry::{OrbitRegistry, OrbitRegistryClient};
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_fund_order_stores_deposit() {
        let env = Env::default();
        env.mock_all_auths();

        let escrow_id = env.register(OrbitEscrow, ());
        let escrow = OrbitEscrowClient::new(&env, &escrow_id);

        let registry_id = env.register(OrbitRegistry, ());
        escrow.initialize(&registry_id);

        let user = Address::generate(&env);
        escrow.fund_order(&user, &1u64, &5_000_000i128);

        let deposit = escrow.get_deposit(&1u64).unwrap();
        assert_eq!(deposit.order_id, 1);
        assert_eq!(deposit.client, user);
        assert_eq!(deposit.amount, 5_000_000i128);
        assert!(!deposit.released);
        assert!(!deposit.refunded);
    }

    #[test]
    fn test_release_payment_marks_released_and_updates_registry() {
        let env = Env::default();
        env.mock_all_auths();

        // Register both contracts
        let registry_id = env.register(OrbitRegistry, ());
        let escrow_id = env.register(OrbitEscrow, ());
        let registry = OrbitRegistryClient::new(&env, &registry_id);
        let escrow = OrbitEscrowClient::new(&env, &escrow_id);

        escrow.initialize(&registry_id);

        let user = Address::generate(&env);
        let title = String::from_str(&env, "Build landing page");

        // Create order in registry, fund escrow
        let order_id = registry.create_order(&user, &title, &10_000_000i128);
        escrow.fund_order(&user, &order_id, &10_000_000i128);

        // Inter-contract call: escrow → registry.update_status(order_id, 1)
        escrow.release_payment(&user, &order_id);

        // Deposit is marked released
        let deposit = escrow.get_deposit(&order_id).unwrap();
        assert!(deposit.released);
        assert!(!deposit.refunded);

        // Registry order status is now 1 (completed) — proof of inter-contract call
        let order = registry.get_order(&order_id).unwrap();
        assert_eq!(order.status, 1);
    }

    #[test]
    fn test_refund_marks_refunded_and_cancels_order() {
        let env = Env::default();
        env.mock_all_auths();

        let registry_id = env.register(OrbitRegistry, ());
        let escrow_id = env.register(OrbitEscrow, ());
        let registry = OrbitRegistryClient::new(&env, &registry_id);
        let escrow = OrbitEscrowClient::new(&env, &escrow_id);

        escrow.initialize(&registry_id);

        let user = Address::generate(&env);
        let title = String::from_str(&env, "Write docs");

        let order_id = registry.create_order(&user, &title, &3_000_000i128);
        escrow.fund_order(&user, &order_id, &3_000_000i128);

        escrow.refund(&user, &order_id);

        let deposit = escrow.get_deposit(&order_id).unwrap();
        assert!(!deposit.released);
        assert!(deposit.refunded);

        // Registry order status is now 2 (cancelled) — proof of inter-contract call
        let order = registry.get_order(&order_id).unwrap();
        assert_eq!(order.status, 2);
    }
}
