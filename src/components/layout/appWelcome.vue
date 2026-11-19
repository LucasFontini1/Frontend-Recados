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

div.left, div.right, div.right .text { min-width: 0; }
div.left, div.right { flex: 1; }
div.right h2, div.left h2 { overflow-wrap: anywhere; }
@media (max-width: 720px) {
 p.life { margin-top: 16px; font-size: 14px; }
 div.principal { flex-direction: column; align-items: stretch; gap: 18px; margin-top: 12px; padding-bottom: 20px; }
 div.left h2 { font-size: clamp(23px, 7vw, 29px); line-height: 1.32; }
 div.left p { margin-top: 10px; font-size: 13px; line-height: 1.7; }
 div.right { width: 100%; border-left: 0; border-radius: 12px; padding: 14px; background: #e7f0eb; gap: 12px; }
 div.right img { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }
 div.right h2 { font-size: 15px; line-height: 1.5; }
 div.right p { font-size: 12px; margin-top: 5px; color: #647273; }
}
</style>