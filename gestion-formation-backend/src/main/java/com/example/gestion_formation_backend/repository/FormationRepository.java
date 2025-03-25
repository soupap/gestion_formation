package com.example.gestion_formation_backend.repository;

import com.example.gestion_formation_backend.model.Formation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationRepository extends JpaRepository<Formation, Long> {
}