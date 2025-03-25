package com.example.gestion_formation_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Formateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String tel;

    @Column(nullable = false)
    private String type; // "Interne" or "Externe"

    @ManyToOne
    @JoinColumn(name = "idEmployeur", nullable = false)
    private Employeur employeur; // Correct relationship
}