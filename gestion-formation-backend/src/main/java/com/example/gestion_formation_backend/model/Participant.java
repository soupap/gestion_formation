package com.example.gestion_formation_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @ManyToOne
    @JoinColumn(name = "idStructure", nullable = false)
    private Structure structure; // Correct relationship

    @ManyToOne
    @JoinColumn(name = "idProfil", nullable = false)
    private Profil profil; // Correct relationship

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String tel;
}