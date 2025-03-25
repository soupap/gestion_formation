package com.example.gestion_formation_backend.repository;

import com.example.gestion_formation_backend.model.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
}