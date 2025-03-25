package com.example.gestion_formation_backend.controller;

import com.example.gestion_formation_backend.model.Formation;
import com.example.gestion_formation_backend.service.FormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
public class FormationController {
    @Autowired
    private FormationService formationService;

    @GetMapping
    public List<Formation> getFormations() {
        return formationService.getAllFormations();
    }

    @PostMapping
    public Formation addFormation(@RequestBody Formation formation) {
        return formationService.addFormation(formation);
    }
}