package com.brunoattina.foque.view

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("NewApi")
@Composable
fun Temporizador (navController: NavController){
    // Variaveis

    var date by remember { mutableStateOf("") }
    var timer by remember { mutableStateOf("") }
    var exibicao by remember { mutableStateOf("") }

    var scope = rememberCoroutineScope()

    LaunchedEffect(Unit){
        var horarioInicio = LocalTime.now()
        while (true){
            var formatterTimer = DateTimeFormatter.ofPattern("HH:mm:ss")
            var horarioAtual = LocalTime.now()
            exibicao = horarioAtual.format(formatterTimer).toString()
            if (horarioAtual >= horarioInicio.plusMinutes(1)){
                navController.navigate("Home")
                break
            }
            delay(500L)
        }
    }


    Scaffold(modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(title = { Text("Foco") })
        }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            HorizontalDivider()
            Text(text = exibicao)
        }
    }
}