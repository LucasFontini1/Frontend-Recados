<template>
    <p class="life">
        - Vida em comunidade
    </p>

    <div class="principal">
        <div class="left">
            <h2>O que acontece na nossa comunidade?</h2>
            <p>
                Encontros, celebrações e recados para vivermos a fé mais perto uns dos outros.
            </p>
        </div>
        <div class="right">
            <img src="/img/logo-removebg-preview.png" alt="">
            <div class="text">
                <h2>A comunidade se encontra aqui</h2>
                <p>Fique por dentro e participe</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
    p.life{
        color: #0A4C34;
        font-size: 20px;
        margin-top: 40px;
        font-family: 'comfortaa';
    }

    div.principal{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-bottom: 25px;
        border-bottom: 1px solid #647273;
    }

    div.left{
        & h2{
            font-size: 30px;
            font-family: 'comfortaa';
        }
        & p{
            font-size: 15px;
            color: #647273;
        }
    }
    
    div.right{
        display: flex;
        gap: 15px;
        border-left: solid 1px #647273;
        padding-left: 20px;
        align-items: center;

        & img{
            width: 12%;
        }

        & h2{
            font-size: 20px;
        }

        & p{
            font-size: 15px;
        }
    }
</style>