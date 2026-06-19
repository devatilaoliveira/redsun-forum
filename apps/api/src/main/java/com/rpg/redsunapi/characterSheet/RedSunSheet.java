package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.tale.Tale;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.util.UUID;

@NullMarked
@Entity
@Table(name = "redsun_sheets")
@PrimaryKeyJoinColumn(name = "id")
public class RedSunSheet extends BasicSheet {

  @Column(length = 120)
  @Nullable String nature;

  @Column(length = 120)
  @Nullable String demeanor;

  int strength;
  int dexterity;
  int stamina;
  int presence;
  int empathy;
  int influence;
  int perception;
  int intellect;
  int determination;
  int alertness;
  int sports;
  int intuition;
  int intimidation;
  int subterfuge;
  int leadership;
  int diplomacy;

  @Column(name = "talent_1_name", length = 120)
  @Nullable String talent1Name;

  @Column(name = "talent_1_level")
  int talent1Level;

  @Column(name = "talent_2_name", length = 120)
  @Nullable String talent2Name;

  @Column(name = "talent_2_level")
  int talent2Level;

  @Column(name = "animal_handling")
  int animalHandling;

  int riding;
  int legerdemain;
  int survival;
  int stealth;
  int etiquette;
  int performance;
  int history;
  int religion;
  int language;
  int occultism;
  int investigation;
  int psychology;
  int business;

  @Column(name = "calling_1_name", length = 120)
  @Nullable String calling1Name;

  @Column(name = "calling_1_level")
  int calling1Level;

  @Column(name = "calling_2_name", length = 120)
  @Nullable String calling2Name;

  @Column(name = "calling_2_level")
  int calling2Level;

  @Column(name = "calling_3_name", length = 120)
  @Nullable String calling3Name;

  @Column(name = "calling_3_level")
  int calling3Level;

  @Column(name = "calling_4_name", length = 120)
  @Nullable String calling4Name;

  @Column(name = "calling_4_level")
  int calling4Level;

  @Column(name = "calling_5_name", length = 120)
  @Nullable String calling5Name;

  @Column(name = "calling_5_level")
  int calling5Level;

  @Column(name = "martial_arts")
  int martialArts;

  int herbalism;
  int rituals;
  int meditation;
  int craft;

  @Column(name = "melee_throwing")
  int meleeThrowing;

  @Column(name = "ranged_weapons")
  int rangedWeapons;

  int unarmed;
  int throwing;

  @Column(name = "exotic_weapons")
  int exoticWeapons;

  @Column(name = "willpower_max")
  int willpowerMax;

  @Column(name = "willpower_current")
  int willpowerCurrent;

  @Column(name = "impetus_max")
  int impetusMax;

  @Column(name = "impetus_current")
  int impetusCurrent;

  @Column(name = "vitality_damage")
  int vitalityDamage;

  @Column(length = 120)
  @Nullable String experience;

  @Column(columnDefinition = "text")
  @Nullable String equipment;

  @Column(columnDefinition = "text")
  @Nullable String notes;

  @Column(name = "active_rituals_effects", columnDefinition = "text")
  @Nullable String activeRitualsEffects;

  @Column(name = "combat_maneuvers", columnDefinition = "text")
  @Nullable String combatManeuvers;

  @Column(columnDefinition = "text")
  @Nullable String arsenal;

  @Column(name = "learned_rituals", columnDefinition = "text")
  @Nullable String learnedRituals;

  @Column(name = "craft_details", columnDefinition = "text")
  @Nullable String craftDetails;

  public RedSunSheet() {
  }

  public RedSunSheet(Tale tale, UUID characterId) {
    super(tale, characterId);
  }
}
