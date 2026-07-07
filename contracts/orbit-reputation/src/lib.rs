#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env,
};

#[contracttype]
pub enum RepKey {
    Score(Address),  // address → ReputationScore
    Total,           // global total completions
}

#[contracttype]
#[derive(Clone)]
pub struct ReputationScore {
    pub address: Address,
    pub completed: u32,   // jobs successfully completed
    pub cancelled: u32,   // jobs cancelled
    pub total_earned: i128, // total stroops earned
    pub rating_sum: u32,  // sum of all ratings (1-5)
    pub rating_count: u32, // number of ratings received
}

#[contract]
pub struct OrbitReputation;

#[contractimpl]
impl OrbitReputation {
    /// Record a completed job for a freelancer. Called after escrow release.
    /// rating: 1–5 stars from the client.
    pub fn record_completion(
        env: Env,
        client: Address,
        freelancer: Address,
        amount_earned: i128,
        rating: u32,
    ) {
        client.require_auth();
        assert!(rating >= 1 && rating <= 5, "rating must be 1-5");
        assert!(amount_earned > 0, "amount must be positive");

        let mut score = Self::get_or_default(&env, &freelancer);
        score.completed += 1;
        score.total_earned += amount_earned;
        score.rating_sum += rating;
        score.rating_count += 1;

        env.storage().persistent().set(&RepKey::Score(freelancer.clone()), &score);
        env.storage().persistent().extend_ttl(&RepKey::Score(freelancer.clone()), 200, 400);
        env.storage().instance().extend_ttl(100, 200);

        // Increment global counter
        let total: u32 = env.storage().instance().get(&RepKey::Total).unwrap_or(0u32);
        env.storage().instance().set(&RepKey::Total, &(total + 1));

        env.events().publish(
            (symbol_short!("rated"), freelancer),
            (amount_earned, rating),
        );
    }

    /// Record a cancelled job — decrements trust score.
    pub fn record_cancellation(env: Env, client: Address, freelancer: Address) {
        client.require_auth();

        let mut score = Self::get_or_default(&env, &freelancer);
        score.cancelled += 1;

        env.storage().persistent().set(&RepKey::Score(freelancer.clone()), &score);
        env.storage().persistent().extend_ttl(&RepKey::Score(freelancer.clone()), 200, 400);
        env.storage().instance().extend_ttl(100, 200);

        env.events().publish((symbol_short!("cancel"), freelancer), ());
    }

    /// Get reputation score for an address.
    pub fn get_score(env: Env, address: Address) -> ReputationScore {
        Self::get_or_default(&env, &address)
    }

    /// Average rating scaled x10 (e.g. 45 = 4.5 stars). Returns 0 if no ratings.
    pub fn get_avg_rating(env: Env, address: Address) -> u32 {
        let score = Self::get_or_default(&env, &address);
        if score.rating_count == 0 {
            return 0;
        }
        (score.rating_sum * 10) / score.rating_count
    }

    /// Total completed jobs across all freelancers.
    pub fn get_total_completions(env: Env) -> u32 {
        env.storage().instance().get(&RepKey::Total).unwrap_or(0u32)
    }

    fn get_or_default(env: &Env, address: &Address) -> ReputationScore {
        env.storage()
            .persistent()
            .get(&RepKey::Score(address.clone()))
            .unwrap_or(ReputationScore {
                address: address.clone(),
                completed: 0,
                cancelled: 0,
                total_earned: 0,
                rating_sum: 0,
                rating_count: 0,
            })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
extern crate std;

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_record_completion_updates_score() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitReputation, ());
        let client = OrbitReputationClient::new(&env, &cid);

        let employer = Address::generate(&env);
        let freelancer = Address::generate(&env);

        client.record_completion(&employer, &freelancer, &10_000_000i128, &5u32);

        let score = client.get_score(&freelancer);
        assert_eq!(score.completed, 1);
        assert_eq!(score.rating_sum, 5);
        assert_eq!(score.rating_count, 1);
        assert_eq!(score.total_earned, 10_000_000i128);
    }

    #[test]
    fn test_avg_rating_scaled() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitReputation, ());
        let client = OrbitReputationClient::new(&env, &cid);

        let employer = Address::generate(&env);
        let freelancer = Address::generate(&env);

        client.record_completion(&employer, &freelancer, &5_000_000i128, &4u32);
        client.record_completion(&employer, &freelancer, &5_000_000i128, &5u32);

        // avg = (4+5)/2 = 4.5 → scaled x10 = 45
        assert_eq!(client.get_avg_rating(&freelancer), 45u32);
    }

    #[test]
    fn test_cancellation_increments_cancelled() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitReputation, ());
        let client = OrbitReputationClient::new(&env, &cid);

        let employer = Address::generate(&env);
        let freelancer = Address::generate(&env);

        client.record_cancellation(&employer, &freelancer);

        let score = client.get_score(&freelancer);
        assert_eq!(score.cancelled, 1);
        assert_eq!(score.completed, 0);
    }

    #[test]
    fn test_global_completions_counter() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register(OrbitReputation, ());
        let client = OrbitReputationClient::new(&env, &cid);

        let e = Address::generate(&env);
        let f1 = Address::generate(&env);
        let f2 = Address::generate(&env);

        assert_eq!(client.get_total_completions(), 0u32);
        client.record_completion(&e, &f1, &1_000_000i128, &5u32);
        client.record_completion(&e, &f2, &2_000_000i128, &4u32);
        assert_eq!(client.get_total_completions(), 2u32);
    }
}
