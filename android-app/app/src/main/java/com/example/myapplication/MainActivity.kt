package com.example.myapplication

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent
import kotlinx.android.synthetic.main.activity_main.*
import android.view.MenuItem
import android.widget.PopupMenu
import android.widget.Toast
import androidx.preference.PreferenceManager
import com.github.kittinunf.fuel.core.extensions.jsonBody
import com.github.kittinunf.fuel.gson.responseObject
import com.github.kittinunf.fuel.httpPost
import com.github.kittinunf.result.Result;
import com.google.gson.Gson
import java.lang.Exception

data class APIRequest(
    var title: String = "",
    var url: String = "",
    var category: String = "",
    var comment: String = ""
)

data class APIResponse(val status: String = "", var message: String = "")

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setSupportActionBar(toolbar)

        val intent = intent
        val action = intent.action
        if (Intent.ACTION_SEND == action) {
            val extras = intent.extras
            val url = extras?.getCharSequence(Intent.EXTRA_TEXT)
            urlTextView.text = url ?: ""
            val title = extras?.getCharSequence(Intent.EXTRA_SUBJECT)
            if (title != null) {
                if (title.isNotEmpty()) {
                    titleTextView.text = title
                } else {
                    titleTextView.text = "Twitter"
                }
            }
        }

        val popupMenu = PopupMenu(this@MainActivity, categoryButton)
        popupMenu.inflate(R.menu.category_menu);
        categoryButton.setOnClickListener {
            popupMenu.show()
        }
        popupMenu.setOnMenuItemClickListener { item: MenuItem? ->
            categoryButton.text = item?.title
            sendButton.isEnabled = true
            false
        }

        sendButton.isEnabled = false
        sendButton.setOnClickListener {
            sendButton.isEnabled = false

            val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)
            val url = sharedPreferences.getString("api_url_preference", "")
            if (url == null) {
                val toast = Toast.makeText(
                    applicationContext,
                    "API URLを設定してください",
                    Toast.LENGTH_LONG
                )
                toast.show()
                sendButton.isEnabled = true
                return@setOnClickListener
            }

            val req = APIRequest(
                titleTextView.text.toString(),
                urlTextView.text.toString(),
                categoryButton.text.toString(),
                editText.text.toString()
            )
            val gson = Gson()
            val json = gson.toJson(req)
            try {
                url.httpPost()
                    .jsonBody(json)
                    .responseObject<APIResponse> {_, response, result ->
                        when (result) {
                            is Result.Failure -> {
                                println(response)
                                val ex = result.getException()
                                println(ex)
                                runOnUiThread {
                                    val toast = Toast.makeText(
                                        applicationContext,
                                        ex.stackTrace.toString(),
                                        Toast.LENGTH_LONG
                                    )
                                    toast.show()
                                    sendButton.isEnabled = true
                                }
                                return@responseObject
                            }
                            is Result.Success -> {
                                if (response.statusCode != 200) {
                                    println(response)
                                    runOnUiThread {
                                        val toast = Toast.makeText(
                                            applicationContext,
                                            "Response Status Code: " + response.statusCode,
                                            Toast.LENGTH_LONG
                                        )
                                        toast.show()
                                        sendButton.isEnabled = true
                                    }
                                    return@responseObject
                                }

                                if (result.value.status != "success") {
                                    println(result.value.message)
                                    runOnUiThread {
                                        val toast = Toast.makeText(
                                            applicationContext,
                                            result.value.message,
                                            Toast.LENGTH_LONG
                                        )
                                        toast.show()
                                        sendButton.isEnabled = true
                                    }
                                    return@responseObject
                                }

                                finish()
                            }
                        }
                    }
            } catch (e: Exception) {
                println(e)
                val toast = Toast.makeText(
                    applicationContext,
                    e.stackTrace.toString(),
                    Toast.LENGTH_LONG
                )
                toast.show()
            }

        }

        settingsButton.setOnClickListener {
            startActivity(Intent(this@MainActivity, SettingsActivity::class.java))
        }

    }

}
