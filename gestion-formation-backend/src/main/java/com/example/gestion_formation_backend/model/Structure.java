package com.example.gestion_formation_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Structure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String libelle;
}