<script>
    import { onMount } from 'svelte';
      const title = '로그인';
    var userLang = "";
    onMount(() => {
        userLang = navigator.language.replace("-", "_");
      });
  </script>
  
  <svelte:head>
      <title>플끄 리턴즈 - {title}</title>
  </svelte:head>
  <div class="dark:bg-gray-900 flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full">
      <h2 class="mt-10 text-center text-5xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
        404 - 찾을 수 없음
      </h2>
    </div>
  
      <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-300">
        <a href="/" class="font-semibold leading-6 text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-500">
          메인으로 돌아가기
        </a><br><br>
        Copyright © 2024 PlKu Team. All rights reserved.
      </p>
  </div>