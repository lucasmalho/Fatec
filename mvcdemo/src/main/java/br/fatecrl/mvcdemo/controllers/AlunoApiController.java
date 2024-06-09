package br.fatecrl.mvcdemo.controllers;


import br.fatecrl.mvcdemo.models.Aluno;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoApiController {

    private static final List<Aluno> alunos = new ArrayList<Aluno>();

    public AlunoApiController() {
        alunos.add(new Aluno("Futebol","Lucas",1,2));
        alunos.add(new Aluno("Basquete","Caio",3,1));
        alunos.add(new Aluno("Beach Tennis","Gustavo",2,3));

    }

    @GetMapping
    public List<Aluno> getAlunos()
    {
     return alunos;
    }

}
