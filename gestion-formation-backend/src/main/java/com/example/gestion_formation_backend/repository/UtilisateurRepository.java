package com.example.gestion_formation_backend.repository;

import com.example.gestion_formation_backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
}