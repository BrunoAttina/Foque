package com.brunoattina.foque.model

import com.google.firebase.firestore.FirebaseFirestore

class DataSource {

    private val db = FirebaseFirestore.getInstance()

    /**
     * Salva uma nova experiência no Firestore.
     * @param titulo O título da experiência a ser salva.
     * @param descricao A descrição da experiência.
     */

    fun consultarExperiencia() {


    }

    fun criarExperiencia() {


    }

    fun salvarExperiencia(experiencia: Int, onSuccess: () -> Unit, onFailure: (Exception) -> Unit) {
        // Cria um mapa com os dados recebidos como parâmetros.
        val map = hashMapOf(
            "experiencia" to experiencia
        )

        // Salva os dados na coleção "personagem".
        db.collection("personagem")
            .add(map)
            .addOnSuccessListener { onSuccess() }
            .addOnFailureListener { e -> onFailure(e)
    }
}