<script>
    import { onMount } from 'svelte';
    const title = '이관 신청';
    var userLang = "";
    onMount(() => {
        userLang = navigator.language.replace("-", "_");
      });
    let isChecked = false;
    let isKKuTuIO = false;
    let currentStep = 1;
  </script>
  
  <svelte:head>
      <title>플끄 리턴즈 - {title}</title>
  </svelte:head>
  <div class="dark:bg-gray-900 py-24">
    <div class={currentStep == 1 ? "text-hero w-full xl:mx-auto xl:max-w-screen-xl" : "hidden"}>
      <h2 class="p-4 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
        계정 이관 신청
      </h2>

      <div class="lg:grid lg:grid-cols-2">
      <div>
        <p class="px-4 text-xl text-black font-bold dark:text-white">이관 신청 안내</p>
        <div class="lg:p-4 p-1 bg-white rounded-xl m-4">
          <img src="/img/web/transfer/transfer_info.png" alt="이관 정보" class="">
        </div>
      </div>
      <div>
        <p class="px-4 text-xl text-black font-bold dark:text-white">유의사항</p>
        <div class="lg:p-4 p-1 bg-white rounded-xl m-4">
          <img src="/img/web/transfer/transfer_warning.png" alt="이관 정보" class="">
        </div>
      </div>
      </div>

      <div class="px-4 lg:px-0 flex items-center justify-center">
        <input type="checkbox" bind:checked={isChecked} class="form-checkbox h-5 w-5 text-blue-600">
        <label for="remember_me" class="ml-2 block text-gray-900 dark:text-gray-100">
          위 회원 이관 신청 안내 및 유의사항을 읽고 이해하였으며, 이에 동의합니다.
        </label>
      </div>

      <div class="px-4 lg:px-0 flex items-center justify-center">
        <input type="checkbox" bind:checked={isKKuTuIO} class="form-checkbox h-5 w-5 text-blue-600">
        <label for="remember_me" class="ml-2 block text-gray-900 dark:text-gray-100">
           <a href="https://cs.kkutu.io/terms" class="text-blue-500 dark:text-blue-300">끄투리오 이용약관</a> 및 <a href="https://cs.kkutu.io/privacy-policy" class="text-blue-500 dark:text-blue-300">개인정보처리방침</a>, <a href="https://cs.kkutu.io/operation" class="text-blue-500 dark:text-blue-300">운영 정책</a>에 동의합니다.
        </label>
      </div>
      
      <div class="mt-4 flex items-center justify-center">
        <button class={isChecked && isKKuTuIO ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl' : 'bg-gray-500 text-white font-bold py-2 px-4 rounded-xl'}
        disabled={!isChecked || !isKKuTuIO}
        on:click={() => currentStep = 2 }>
          이관 신청
        </button>
      </div>

    </div>
    <div class={currentStep == 2 ? "glassFraction-2 w-full xl:mx-auto xl:max-w-screen-xl" : "hidden"}>
      <h2 class="p-4 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
        사용자 정보 입력
      </h2>

      <div class="lg:grid lg:grid-cols-2">
      <div>
        <p class="px-4 text-xl text-black font-bold dark:text-white">로그인이 되어 있을 시, 보안 코드는 필요 없습니다</p>
      </div>
      </div>
      
      <div class="mt-4 flex items-center justify-center">
        <button class={isKKuTuIO ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl' : 'bg-gray-500 text-white font-bold py-2 px-4 rounded-xl'} disabled={!isChecked}
        on:click={() => currentStep = 2}>
          이관 신청
        </button>
      </div>

    </div>
  </div>