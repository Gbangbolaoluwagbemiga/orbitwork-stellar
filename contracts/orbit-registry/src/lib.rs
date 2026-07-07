#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec,
    Address, Env, String, Vec,
};

#[contracttype]
pub enum DataKey {
    Count,
    Order(u64),
    Apps(u64),   // Vec<Application> for an order
}

#[contracttype]
#[derive(Clone)]
pub struct WorkOrder {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub duration: u32,       // days
    pub status: u32,         // 0=open, 1=completed, 2=cancelled
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Application {
    pub freelancer: Address,
    pub cover_letter: String,
    pub timeline: u32,       // proposed days
    pub applied_at: u64,
}

#[contract]
pub struct OrbitRegistry;

#[contractimpl]
impl OrbitRegistry {
    pub fn create_order(
        env: Env,
        client: Address,
        title: String,
        description: String,
        amount: i128,
        duration: u32,
    ) -> u64 {
        client.require_auth();

        let count: u64 = env.storage().instance().get(&DataKey::Count).unwrap_or(0u64);
        let id = count + 1;

        let order = WorkOrder {
            id,
            client: client.clone(),
            title: title.clone(),
            description: description.clone(),
            amount,
            duration,
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

    pub fn apply_to_job(
        env: Env,
        order_id: u64,
        freelancer: Address,
        cover_letter: String,
        timeline: u32,
    ) -> bool {
        freelancer.require_auth();

        let order: WorkOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        assert!(order.status == 0, "order is not open");
        assert!(order.client != freelancer, "cannot apply to own job");

        // Prevent duplicate applications
        let mut apps: Vec<Application> = env
            .storage()
            .persistent()
            .get(&DataKey::Apps(order_id))
            .unwrap_or_else(|| vec![&env]);

        for app in apps.iter() {
            assert!(app.freelancer != freelancer, "already applied");
        }

        apps.push_back(Application {
            freelancer: freelancer.clone(),
            cover_letter,
            timeline,
            applied_at: env.ledger().timestamp(),
        });

        env.storage().persistent().set(&DataKey::Apps(order_id), &apps);
        env.storage().persistent().extend_ttl(&DataKey::Apps(order_id), 100, 200);

        env.events().publish(
            (symbol_short!("applied"), freelancer),
            (order_id, timeline),
        );

        true
    }

    pub fn has_applied(env: Env, order_id: u64, freelancer: Address) -> bool {
        let apps: Vec<Application> = env
            .storage()
            .persistent()
            .get(&DataKey::Apps(order_id))
            .unwrap_or_else(|| vec![&env]);

        for app in apps.iter() {
            if app.freelancer == freelancer {
                return true;
            }
        }
        false
    }

    pub fn get_applications(env: Env, order_id: u64) -> Vec<Application> {
        env.storage()
            .persistent()
            .get(&DataKey::Apps(order_id))
            .unwrap_or_else(|| vec![&env])
    }

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

    fn setup() -> (Env, soroban_sdk::Address, OrbitRegistryClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitRegistry, ());
        let client = OrbitRegistryClient::new(&env, &cid);
        let user = Address::generate(&env);
        (env, user, client)
    }

    #[test]
    fn test_create_order_increments_count() {
        let (env, user, client) = setup();
        let title = String::from_str(&env, "Write a smart contract");
        let desc = String::from_str(&env, "Build a Soroban escrow contract");
        assert_eq!(client.get_count(), 0);
        let id = client.create_order(&user, &title, &desc, &5_000_000i128, &7u32);
        assert_eq!(id, 1);
        assert_eq!(client.get_count(), 1);
    }

    #[test]
    fn test_get_order_returns_correct_fields() {
        let (env, user, client) = setup();
        let title = String::from_str(&env, "Build a dApp");
        let desc = String::from_str(&env, "Full stack Stellar dApp");
        let id = client.create_order(&user, &title, &desc, &10_000_000i128, &14u32);
        let order = client.get_order(&id).unwrap();
        assert_eq!(order.id, 1);
        assert_eq!(order.client, user);
        assert_eq!(order.amount, 10_000_000);
        assert_eq!(order.duration, 14);
        assert_eq!(order.status, 0);
    }

    #[test]
    fn test_apply_to_job_and_has_applied() {
        let (env, client_addr, client) = setup();
        let title = String::from_str(&env, "Design a UI");
        let desc = String::from_str(&env, "React UI for DeFi project");
        let id = client.create_order(&client_addr, &title, &desc, &2_000_000i128, &5u32);

        let freelancer = Address::generate(&env);
        let letter = String::from_str(&env, "I have 5 years of React experience");
        assert!(!client.has_applied(&id, &freelancer));

        let ok = client.apply_to_job(&id, &freelancer, &letter, &5u32);
        assert!(ok);
        assert!(client.has_applied(&id, &freelancer));
    }

    #[test]
    fn test_update_status_changes_order_state() {
        let (env, user, client) = setup();
        let title = String::from_str(&env, "Design a UI");
        let desc = String::from_str(&env, "Minimal dark theme UI");
        let id = client.create_order(&user, &title, &desc, &2_000_000i128, &3u32);
        assert_eq!(client.get_order(&id).unwrap().status, 0);
        let ok = client.update_status(&id, &1u32);
        assert!(ok);
        assert_eq!(client.get_order(&id).unwrap().status, 1);
    }
}
