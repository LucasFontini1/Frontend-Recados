<script setup>
import router from '@/router'
</script>
<template>
  <header>
    <div class="total">
    <div class="logo">
      <img src="/img/logo-removebg-preview.png" alt="logo" @click="router.push('/')" />
      <div class="text">
        <h1>Portal da comunicação</h1>
        <p>Da comunidade - Um lugar para se encontrar</p>
      </div>
    </div>
    <div class="security">
        <button>
<span class="mdi mdi-security"></span><span class="enter">Entrar como admin</span></button>
    </div>
    </div>
  </header>
</template>
<style scoped>
    header{
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #D6E1DF;
    }
    div.total{
        display: flex;
        justify-content: space-between;
        width: 70%;
        padding: 10px;
        align-items: center;
    }

    div.logo{
        display: flex;
        align-items: center;
        gap: 20px;

        & img{
            width: 20%;
        }

        & h1{
            font-size: 25px;
            margin-bottom: 5px;
        }
        & p{
            font-size: 15px;
            color: #647273;
        }
    }

    div.security{

        & button:first-child{
            background-color: #F8FAFD;
            border: #D6E1DF 1px solid;
            padding: 10px 20px;
            display: flex;
            gap: 10px;
            font-size: 15px;
            border-radius: 10px;
            transition: 0.2s;
        }

        & button:hover{
            background-color: #bbc5c3;
            cursor: pointer;
        }
    }
</style>