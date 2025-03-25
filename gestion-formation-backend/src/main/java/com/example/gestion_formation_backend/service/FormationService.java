package com.example.gestion_formation_backend.service;

import com.example.gestion_formation_backend.model.Formation;
import com.example.gestion_formation_backend.repository.FormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormationService {
    @Autowired
    private FormationRepository formationRepository;

    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    public Formation addFormation(Formation formation) {
        return formationRepository.save(formation);
    }
}