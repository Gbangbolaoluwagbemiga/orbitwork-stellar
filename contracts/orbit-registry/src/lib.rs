#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String,
};

#[contracttype]
pub enum DataKey {
    Count,
    Order(u64),
}

#[contracttype]
#[derive(Clone)]
pub struct WorkOrder {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub amount: i128,
    pub status: u32,     // 0=open, 1=completed, 2=cancelled
    pub created_at: u64,
}

#[contract]
pub struct OrbitRegistry;

#[contractimpl]
impl OrbitRegistry {
    pub fn create_order(env: Env, client: Address, title: String, amount: i128) -> u64 {
        client.require_auth();

        let count: u64 = env.storage().instance().get(&DataKey::Count).unwrap_or(0u64);
        let id = count + 1;

        let order = WorkOrder {
            id,
            client: client.clone(),
            title: title.clone(),
            amount,
            status: 0,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Count, &id);
        env.storage().persistent().set(&DataKey::Order(id), &order);
        env.storage().persistent().extend_ttl(&DataKey::Order(id), 100, 200);
        env.storage().instance().extend_ttl(100, 200);

        env.events().publish((symbol_short!("created"), client), (id, amount, title));
        id
    }

    /// Update order status — callable directly by the client or via the escrow
    /// contract as a sub-invocation (client.require_auth() is satisfied by the
    /// top-level transaction auth in both cases).
    pub fn update_status(env: Env, id: u64, new_status: u32) -> bool {
        assert!(new_status <= 2, "invalid status: must be 0, 1, or 2");

        let mut order: WorkOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Order(id))
            .expect("order not found");

        order.client.require_auth();

        order.status = new_status;
        env.storage().persistent().set(&DataKey::Order(id), &order);
        env.storage().persistent().extend_ttl(&DataKey::Order(id), 100, 200);

        env.events().publish(
            (symbol_short!("status"), order.client.clone()),
            (id, new_status),
        );

        true
    }

    pub fn get_order(env: Env, id: u64) -> Option<WorkOrder> {
        env.storage().persistent().get(&DataKey::Order(id))
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0u64)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
extern crate std;

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_create_order_increments_count() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitRegistry, ());
        let client = OrbitRegistryClient::new(&env, &cid);
        let user = Address::generate(&env);
        let title = String::from_str(&env, "Write a smart contract");

        assert_eq!(client.get_count(), 0);
        let id = client.create_order(&user, &title, &5_000_000i128);
        assert_eq!(id, 1);
        assert_eq!(client.get_count(), 1);
    }

    #[test]
    fn test_get_order_returns_correct_fields() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitRegistry, ());
        let client = OrbitRegistryClient::new(&env, &cid);
        let user = Address::generate(&env);
        let title = String::from_str(&env, "Build a dApp");
        let amount = 10_000_000i128;

        let id = client.create_order(&user, &title, &amount);
        let order = client.get_order(&id).unwrap();

        assert_eq!(order.id, 1);
        assert_eq!(order.client, user);
        assert_eq!(order.amount, amount);
        assert_eq!(order.status, 0);
    }

    #[test]
    fn test_update_status_changes_order_state() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitRegistry, ());
        let client = OrbitRegistryClient::new(&env, &cid);
        let user = Address::generate(&env);
        let title = String::from_str(&env, "Design a UI");

        let id = client.create_order(&user, &title, &2_000_000i128);
        assert_eq!(client.get_order(&id).unwrap().status, 0);

        let ok = client.update_status(&id, &1u32);
        assert!(ok);
        assert_eq!(client.get_order(&id).unwrap().status, 1);
    }

    #[test]
    fn test_multiple_orders_have_sequential_ids() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitRegistry, ());
        let client = OrbitRegistryClient::new(&env, &cid);
        let user = Address::generate(&env);
        let t1 = String::from_str(&env, "Task A");
        let t2 = String::from_str(&env, "Task B");

        let id1 = client.create_order(&user, &t1, &1_000_000i128);
        let id2 = client.create_order(&user, &t2, &2_000_000i128);
        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(client.get_count(), 2);
    }
}
