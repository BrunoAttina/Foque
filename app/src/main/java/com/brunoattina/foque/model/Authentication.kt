package com.brunoattina.foque.model

import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth

class Authentication {
    private val auth = Firebase.auth

    public val user = auth.currentUser

    public fun login(email: String, senha: String, onResult: (String) -> Unit) {
        auth.signInWithEmailAndPassword(email, senha)
            .addOnCompleteListener{ task ->
                if(task.isSuccessful){
                    Log.d("Autentication", "Login efetuado com sucesso.")
                    onResult("ok")
                }else{
                    Log.d("Autentication", "Erro durante login.")
                    onResult(task.exception.toString())
                    Log.d("Autentication", task.exception?.message.toString())
                }
            }
    }

    public fun cadastro(email: String, senha: String, onResult: (String) -> Unit){
        auth.createUserWithEmailAndPassword(email, senha)
            .addOnCompleteListener{ task ->
                if(task.isSuccessful){
                    Log.d("Autentication", "Conta criada com sucesso.")
                    onResult("ok")
                }else{
                    Log.d("Autentication", "Erro durante criação da conta.")
                    onResult(task.exception.toString())
                    Log.d("Autentication", task.exception?.message.toString())
                }
            }
    }

    public fun verificaLogado(): Boolean{
        if(auth.currentUser != null){
            return true
        }else{
            return false
        }
    }

    public fun logout(){
        auth.signOut()
    }
}