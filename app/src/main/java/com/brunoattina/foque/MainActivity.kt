package com.brunoattina.foque

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.brunoattina.foque.ui.theme.FoqueTheme
import com.brunoattina.foque.view.Home
import com.brunoattina.foque.view.Temporizador

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FoqueTheme {
                val navController = rememberNavController()

                NavHost(navController, startDestination = "Home") {
                    composable(route = "Home"){
                        Home(navController)
                    }
                    composable(route = "Temporizador"){
                        Temporizador(navController)
                    }
                }
            }
        }
    }
}