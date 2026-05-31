
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.plugin.serialization)
    alias(ktorLibs.plugins.ktor)
    alias(libs.plugins.openapi.generator)
}

group = "com.booking"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "com.booking.ApplicationKt"
}

kotlin {
    jvmToolchain(21)
}

sourceSets {
    main {
        kotlin {
            srcDir("${layout.buildDirectory.get()}/generated/src/main/kotlin")
        }
    }
}

openApiGenerate {
    generatorName.set("kotlin")
    inputSpec.set("${rootDir}/../tsp-output/@typespec/openapi3/openapi.yaml")
    outputDir.set("${layout.buildDirectory.get()}/generated")
    packageName.set("com.booking.generated")
    modelPackage.set("com.booking.generated.model")
    apiPackage.set("com.booking.generated.api")
    invokerPackage.set("com.booking.generated.invoker")
    globalProperties.set(mapOf(
        "modelDocs" to "false",
        "models" to "",
        "apis" to "false",
        "apiDocs" to "false",
        "apiTests" to "false",
        "modelTests" to "false"
    ))
    configOptions.set(mapOf(
        "library" to "multiplatform",
        "dateLibrary" to "kotlinx-datetime",
        "collectionType" to "list"
    ))
}

tasks.named("compileKotlin") {
    dependsOn(tasks.openApiGenerate)
}

dependencies {
    implementation(ktorLibs.server.config.yaml)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.server.statusPages)
    implementation(ktorLibs.server.callLogging)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.datetime)
    implementation(libs.logback.classic)

    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)

}
