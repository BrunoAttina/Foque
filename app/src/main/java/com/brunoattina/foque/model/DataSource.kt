package com.brunoattina.foque.model

import com.google.firebase.firestore.FirebaseFirestore

class DataSource {

    private val db = FirebaseFirestore.getInstance()

    /**
     * Salva uma nova experiência no Firestore.
     * @param titulo O título da experiência a ser salva.
     * @param descricao A descrição da experiência.
     */
    fun salvarExperiencia(titulo: String, descricao: String) {
        // Cria um mapa com os dados recebidos como parâmetros.
        val experiencia = hashMapOf(
            "titulo" to titulo,
            "descricao" to descricao
        )

        // Salva os dados na coleção "personagem".
        db.collection("personagem")
            .add(experiencia)
            .addOnSuccessListener { documentReference ->
                println("Documento salvo com ID: ${documentReference.id}")
            }
            .addOnFailureListener { e ->
                println("Erro ao salvar documento: $e")
            }
    }
}