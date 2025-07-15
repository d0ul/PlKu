<script>
    import { onMount } from 'svelte';
      const title = '게임 소개';
    var userLang = "";
    onMount(() => {
        userLang = navigator.language.replace("-", "_");
      });
  </script>
  
  <svelte:head>
      <title>플끄 리턴즈 - {title}</title>
  </svelte:head>

  
	<header id="up" class="bg-center bg-fixed h-screen relative"  style="background-image:url(/img/bg/pattern.png);">
		<!-- Overlay Background + Center Control -->
		<div class="h-screen flex items-center justify-center backdrop-blur-sm" style="background:rgba(0,0,0,0.7);">
			<div class="mx-2 text-center">
				
        <h2 class="text-gray-200 text-3xl xs:text-4xl md:text-5xl leading-tight">
          KKUTU ONLINE
         </h2>  
        <h1 class="text-gray-100 font-extrabold text-6xl xs:text-6xl md:text-8xl">
					글자로 놀자! <br class="lg:hidden">끄투 온라인
        </h1>
        <p class="mt-3 text-gray-200 hidden md:block text-xl leading-tight">
          <strong>끄투 온라인</strong>은 개발자 쪼리핑이 2000년대 인기를 끌었던 넷마블의 파워쿵쿵따를 오마주하여 
          대학 과제로 제작한 온라인 게임입니다.<br>
          <a href="https://free.kkutu.kr/museum" class="underline rounded-xl p-1 transform ease-in duration-100 active:scale-95 hover:backdrop-blur-lg hover:bg-white/20">
            2017년 서비스 종료</a>이후로 비단 플끄 리턴즈 뿐만 아닌
            <a href="https://free.kkutu.kr/" class="underline rounded-xl p-1 transform ease-in duration-100 active:scale-95 hover:backdrop-blur-lg hover:bg-white/20">
            다양한 프리서버가</a>등장하였습니다.<br>
            이 중에는 여러분들이 한번쯤 들어봤을<a href="https://kkutu.co.kr/" class="underline rounded-xl p-1 transform ease-in duration-100 active:scale-95 hover:backdrop-blur-lg hover:bg-white/20">
              끄투코리아</a>나<a href="https://kkutu.io/" class="underline rounded-xl p-1 transform ease-in duration-100 active:scale-95 hover:backdrop-blur-lg hover:bg-white/20">끄투리오</a>등이 있으며,<br>
          플끄 리턴즈는 특색있는 프리서버로 자리잡았습니다.
        </p>  
        </div>
    </div>
</header>