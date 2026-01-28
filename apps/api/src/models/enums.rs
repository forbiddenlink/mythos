use async_graphql::Enum;
use serde::{Deserialize, Serialize};
use sqlx::Type;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "confidence_level", rename_all = "lowercase")]
pub enum ConfidenceLevel {
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "relationship_type", rename_all = "snake_case")]
pub enum RelationshipType {
    ParentOf,
    SpouseOf,
    SiblingOf,
    Created,
    Killed,
    Transformed,
    EnemyOf,
    AllyOf,
    Taught,
    Served,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "story_category", rename_all = "snake_case")]
pub enum StoryCategory {
    CreationMyth,
    HeroicEpic,
    CosmogonyTheogony,
    TransformationMetamorphosis,
    WarBattle,
    LoveRomance,
    TrickeryDeception,
    QuestJourney,
    PunishmentRetribution,
    DivineBirth,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "event_type", rename_all = "lowercase")]
pub enum EventType {
    Birth,
    Death,
    Battle,
    Transformation,
    Creation,
    Marriage,
    Ascension,
    Journey,
    Punishment,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "location_type", rename_all = "snake_case")]
pub enum LocationType {
    Mountain,
    Temple,
    Underworld,
    Heaven,
    River,
    City,
    Sea,
    Forest,
    Cave,
    Palace,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type, Enum)]
#[sqlx(type_name = "association_type", rename_all = "snake_case")]
pub enum AssociationType {
    BornAt,
    DiedAt,
    RulesOver,
    TempleAt,
    AssociatedWith,
    WorshippedAt,
    ImprisonedAt,
    TransformedAt,
}
