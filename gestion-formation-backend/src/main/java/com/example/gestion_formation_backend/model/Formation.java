package com.example.gestion_formation_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Formation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private int annee;

    @Column(nullable = false)
    private int duree; // Duration in days

    @ManyToOne
    @JoinColumn(name = "idDomaine", nullable = false)
    private Domaine domaine; // Correct relationship

    @Column(nullable = false)
    private double budget;
}