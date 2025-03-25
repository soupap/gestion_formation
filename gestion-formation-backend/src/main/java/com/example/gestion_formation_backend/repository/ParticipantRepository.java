package com.example.gestion_formation_backend.repository;

import com.example.gestion_formation_backend.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
}