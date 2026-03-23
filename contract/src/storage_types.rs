use soroban_sdk::{contracttype, Address, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Keyed by market_id. Represents a prediction market instance.
    Market(u64),
    /// Keyed by (market_id, predictor). Represents a user's prediction in a given market.
    Prediction(u64, Address),
    /// Keyed by user address. Represents an individual user's profile or state.
    User(Address),
    /// Keyed by season_id. Stores the leaderboard rankings per season.
    Leaderboard(u64),
    /// Keyed by season number. Represents a season's metadata and schedule.
    Season(u32),
    /// Keyed by code symbol. Maps an invite code to its underlying metadata.
    InviteCode(Symbol),
    /// Singleton. Holds global configuration for the platform.
    Config,
    /// Global counter. Tracks the total number of markets created.
    MarketCount,
    /// Global counter. Tracks the total number of seasons.
    SeasonCount,
    /// Emergency pause flag. Used to halt sensitive operations across the platform.
    Paused,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Prediction {
    /// The ID of the market this prediction is designated for.
    pub market_id: u64,
    /// The address of the user who submitted this prediction.
    pub predictor: Address,
    /// The specific outcome symbol the user predicted.
    pub chosen_outcome: Symbol,
    /// The total amount of native tokens (XLM) staked by the user, in stroops.
    pub stake_amount: i128,
    /// The ledger timestamp indicating when this prediction was submitted.
    pub submitted_at: u64,
    /// Indicates whether the user has successfully claimed their payout after resolution. Defaults to false.
    pub payout_claimed: bool,
    /// The final portion of XLM the user won, populated after resolution. Defaults to 0.
    pub payout_amount: i128,
}

impl Prediction {
    /// Creates an unresolved Prediction struct instance initialized with default payment metrics.
    pub fn new(
        market_id: u64,
        predictor: Address,
        chosen_outcome: Symbol,
        stake_amount: i128,
        submitted_at: u64,
    ) -> Self {
        Self {
            market_id,
            predictor,
            chosen_outcome,
            stake_amount,
            submitted_at,
            payout_claimed: false,
            payout_amount: 0,
        }
    }
}
