#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String,
};

// ── Storage keys ─────────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Count,
    Order(u64),
}

// ── Data types ────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub struct WorkOrder {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub amount: i128,    // in stroops (1 XLM = 10_000_000)
    pub status: u32,     // 0 = open, 1 = completed, 2 = cancelled
    pub created_at: u64,
}

// ── Contract ──────────────────────────────────────────────────────
#[contract]
pub struct OrbitRegistry;

#[contractimpl]
impl OrbitRegistry {
    /// Create a new work order — returns the new order ID.
    pub fn create_order(env: Env, client: Address, title: String, amount: i128) -> u64 {
        client.require_auth();

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0u64);
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

        // Extend TTL so entries survive on testnet
        env.storage().persistent().extend_ttl(&DataKey::Order(id), 100, 200);
        env.storage().instance().extend_ttl(100, 200);

        // Emit event: topics = (symbol, client), data = (id, amount, title)
        env.events().publish(
            (symbol_short!("created"), client),
            (id, amount, title),
        );

        id
    }

    /// Read a work order by ID.
    pub fn get_order(env: Env, id: u64) -> Option<WorkOrder> {
        env.storage().persistent().get(&DataKey::Order(id))
    }

    /// Total work orders ever created.
    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0u64)
    }
}
