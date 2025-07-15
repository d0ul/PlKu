<script>
    import { onMount } from 'svelte';
    const title = '(1) 모레미 - 모렘톡';
    var userLang = "";
	  import './classicUI.css';
    let randomMessageArray = ["나랑 끄투할 사람", "모렘톡 접률 낮음", "화학단대 101체인", "여기에 상태메시지 입력", "쿵쿵따 ㄱ", "끄투 못한지 3일차"];
    const randomMessage = randomMessageArray[Math.floor(Math.random() * randomMessageArray.length)];
    var messageData = [
      {
        "isUserInput": false,
        "type": "text",
        "content": "Loading...",
        "choice": [""],
        "response": [""]
      }
    ]
    //responseData const에 답변에 대한 답장 데이터 추가
    const responseData = [
      {
        "keyword": "누구지?",
        "type": "continuousSelection",
        "messages": ["너 끄투하면서 날 진짜로 모르는거야?", "/img/attachments/moremi_proof_02.png", "너랑 게임도 해 줬잖아..."],
        "content": "진짜로 나 몰라?",
        "choice": ["모르겠어", "아... 알겠어!"],
        "response": [""],
      },
      {
        "keyword": "모르겠어",
        "type": "text",
        "messages": [""],
        "content": "미안해. 내가 나갈게...",
        "choice": [""],
        "response": [""],
      },
      {
        "keyword": "아... 알겠어!",
        "type": "continuousSelection",
        "messages": ["ㅇㅇ"],
        "content": "",
        "choice": ["그래서 왜 부른건데?", "왜 불렀어?"],
        "response": [""],
      },
      {
        "keyword": "그래서 왜 부른건데?",
        "type": "continuousSelection",
        "messages": ["나 일자리 잃을 거 같아", "대표님이 우리 섭종한대", "/img/attachments/moremi_kkutuio_01.png"],
        "content": "일자리 잃을 거 같다고?",
        "choice": ["뭐야 그게 무슨 소리야", "에이 설마 ㅋㅋㅋㅋ"],
        "response": [""],
      },
      {
        "keyword": "왜 불렀어?",
        "type": "continuousSelection",
        "messages": ["나 일자리 잃을 거 같아", "대표님이 우리 섭종한대", "/img/attachments/moremi_kkutuio_01.png"],
        "content": "일자리 잃을 거 같다고?",
        "choice": ["뭐야 그게 무슨 소리야", "에이 설마 ㅋㅋㅋㅋ"],
        "response": [""],
      },
      {
        "keyword": "뭐야 그게 무슨 소리야",
        "type": "continuousSelection",
        "messages": ["동시에 진짜로 서비스 종료한다는데?", "사실 나도 같이 끄투 할 사람이 없어서 외로웠어", "플끄 망하면 다른 곳 알아봐야지"],
        "content": "알고 있는 다른 끄투 있어?",
        "choice": ["끄투리오", "플끄 리턴즈 말고도 있어?"],
        "response": [""],
      },
      {
        "keyword": "플끄 리턴즈 말고도 있어?",
        "type": "text",
        "messages": [""],
        "content": "플끄 리턴즈 말고도 다른 끄투도 있거든.\n마인크래프트 서버 알지? 생야생 서버도 있고 하잖아\n그거처럼 누구나 끄투를 만들 수 있어.",
        "choice": [""],
        "response": [""],
      },
      {
        "keyword": "에이 설마 ㅋㅋㅋㅋ",
        "type": "text",
        "messages": [""],
        "content": "대표님은 한다고 하면 진짜로 해",
        "choice": [""],
        "response": [""],
      },
      {
        "keyword": "끄투리오",
        "type": "continuousSelection",
        "messages": ["너도 알고 있구나", "그래서 나 거기로 가려고"],
        "content": "짐도 다 챙겼어",
        "choice": ["짐 내껀데..?"],
        "response": [""],
      },
      {
        "keyword": "짐 내껀데..?",
        "type": "continuousSelection",
        "messages": ["에이 내가 뺏어가겠냐고 ㅋㅋㅋㅋ", "대표님이 옮겨준다고 했는데", "경치랑 핑이랑 아이템이랑", "브금이랑 모드랑", "전부 옮겨준다는데 안갈거야?"],
        "content": "",
        "choice": ["그럼... 나도 가야지"],
        "response": [""],
      },
      {
        "keyword": "그럼... 나도 가야지",
        "type": "continuousSelection",
        "messages": ["좋은 생각이야", "사실 대표님이 끄투리오 대표님이랑 연락해서", "통합을 하게 됐거든", "그동안 사람 없어서 불편했던거 해결될거 같아", "거기는 동시 접속자가 50명이 넘을때가 많아"],
        "content": "",
        "choice": ["이미 끄투리오를 하고 있어", "그래서 옮기려면 어떻게 해야 해?"],
        "response": [""],
      },
      {
        "keyword": "이미 끄투리오를 하고 있어",
        "type": "continuousSelection",
        "messages": ["이미 하고 있었구나!", "그럼 끄투리오에서 기다리고 있을게!", "이전 과정은 내가 알려줄게", "일단 조심해야 하는 점이라면, 경험치는 100% 그대로 옮겨지진 않아"],
        "content": "괜찮겠어?",
        "choice": ["그래도 괜찮아"],
        "response": [""],
      },
      {
        "keyword": "그래도 괜찮아",
        "type": "selection",
        "messages": [""],
        "content": "그럼 방법을 알려줄까?",
        "choice": ["방법을 알려 줘"],
        "response": [""],
      },
      {
        "keyword": "그래서 옮기려면 어떻게 해야 해?",
        "type": "continuousSelection",
        "messages": ["크흠... 이건 비밀인데", "진짜로 궁금하단 말이지?"],
        "content": "진짜로?",
        "choice": ["방법을 알려 줘"],
        "response": [""],
      },
      {
        "keyword": "방법을 알려 줘",
        "type": "continuousSelection",
        "messages": ["그렇게 어렵진 않아", "플끄에서 보안 코드를 복사해서 끄투리오의 방법을 따르면 되거든", "이전은 오늘 당장 할 수 있진 않고 6월 중부터 할 수 있어", "이미 지났다면 할 수 있고", "그럼 이제 끄투리오로 가봐!", "이전은 12월 30일까지, 플끄 접속은 동시에까지 가능하니까 알아 둬"],
        "content": "난 먼저 가 있을게!",
        "choice": ["안녕~"],
        "response": [""],
      },
      {
        "keyword": "안녕~",
        "type": "text",
        "messages": [""],
        "content": "안녕~",
        "choice": [""],
        "response": [""],
      },
    ]
    onMount(() => {
        userLang = navigator.language.replace("-", "_");
      // @ts-ignore
      var objDiv = document.querySelector(".h-full");

        if (document.cookie.indexOf("messageData") >= 0) {
          // @ts-ignore
          messageData = JSON.parse(getCookie("messageData"));
          // @ts-ignore
          objDiv.scrollTop = objDiv.scrollHeight;
        }
        else {
          messageData = [
            {
              "isUserInput": false,
              "type": "selection",
              "content": "으음... 안녕?",
              "choice": ["누구지?"],
              "response": [""]
            }
          ]
        }
    });

    // @ts-ignore
    function getCookie(name) {
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      // @ts-ignore
      if (parts.length == 2) return parts.pop().split(";").shift();
    }

    // @ts-ignore
    function pushMessage(isUserInput, content="제목이 지정되어있지 않습니다", type="text") {
      // @ts-ignore
      var objDiv = document.querySelector(".h-full");

      for (let i = 0; i < messageData.length; i++) {
        if (messageData[i].content == content) {
          return;
        }
      }

      if (!isUserInput) {
        setTimeout(() => {
          messageData = [...messageData, {
            "isUserInput": isUserInput,
            "type": type,
            "content": content,
            "choice": [""],
            "response": [""]
          }];
        }, Math.floor(Math.random() * 5000) + 1000);
                  // @ts-ignore
                  objDiv.scrollTop = objDiv.scrollHeight;
      }
      else{
        messageData = [...messageData, {
          "isUserInput": isUserInput,
          "type": type,
          "content": content,
          "choice": [""],
          "response": [""]
        }];
                  // @ts-ignore
                  objDiv.scrollTop = objDiv.scrollHeight;
          for (let i = 0; i < responseData.length; i++) {
            if (responseData[i].keyword == content) {
              if (responseData[i].type == "continuousSelection") {
                for (let j = 0; j < responseData[i].messages.length; j++) {
                  setTimeout(() => {
                    if (responseData[i].messages[j].includes("/img")) {
                      messageData = [...messageData, {
                        "isUserInput": false,
                        "type": "image",
                        "content": responseData[i].messages[j],
                        "choice": [""],
                        "response": [""]
                      }];
                    }
                    else {
                      messageData = [...messageData, {
                        "isUserInput": false,
                        "type": "text",
                        "content": responseData[i].messages[j],
                        "choice": [""],
                        "response": [""]
                      }];
                    }
                  // @ts-ignore
                  objDiv.scrollTop = objDiv.scrollHeight;
                  }, 2000 + Math.floor(j * 2000));
                }
                setTimeout(() => {
                  messageData = [...messageData, {
                    "isUserInput": false,
                    "type": "selection",
                    "content": responseData[i].content,
                    "choice": responseData[i].choice,
                    "response": responseData[i].response
                  }];
                  // @ts-ignore
                  objDiv.scrollTop = objDiv.scrollHeight;

                }, Math.floor(responseData[i].messages.length * 2000) + 4000);
              }
              else{
              setTimeout(() => {messageData = [...messageData, {
                        "isUserInput": false,
                        "type": responseData[i].type,
                        "content": responseData[i].content,
                        "choice": responseData[i].choice,
                        "response": responseData[i].response
                      }];
                  // @ts-ignore
                  objDiv.scrollTop = objDiv.scrollHeight;
              }, Math.floor(Math.random() * 5000) + 1000);
              }
            }
          }
      }

      document.cookie = "messageData=" + JSON.stringify(messageData);
    }
  </script>
  
  <svelte:head>
      <title>{title}</title>
  </svelte:head>
  
  <div class="flex h-screen bg-gray-200">
    <!-- Sidebar -->
    <div class="bg-white w-64 hidden lg:block">
      <div class="text-xl shadow-md w-full p-4 bg-gray-700 mb-4 text-white">
        대화상대
      </div>
      <div class="space-y-4 px-4">
        <div class="flex items-center">
          <img class="h-10 w-10 rounded-full" src="/img/친친모레미.png" alt="친한 친구">
          <div class="ml-4">
            <h3 class="font-semibold">모레미</h3>
            <p class="text-sm text-gray-500">{randomMessage}</p>
          </div>
        </div>
        <div class="flex items-center opacity-50">
          <img class="h-10 w-10 rounded-full" src="/icon/favicon-96x96.png" alt="플끄 리턴즈">
          <div class="ml-4">
            <h3 class="font-semibold">플끄 리턴즈</h3>
            <p class="text-sm text-gray-500">대화상대 없음</p>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Chat area -->
    <div class="flex-1">
      <div class="h-full space-y-4 overflow-auto p-6">
        {#each messageData as { isUserInput, type, content, choice, response}}
        <div class={isUserInput ? 'flex justify-end items-end space-x-reverse space-x-2 userMessage' : 'flex items-end space-x-2 userMessage'}>
          {#if !isUserInput}
            <img class="h-10 w-10 rounded-full" src="/img/친친모레미.png" alt="모레미">
          {/if}
          <div class="flex-col">
            {#if isUserInput}
              <div class="bg-blue-500 text-white font-semibold text-lg rounded-xl px-4 py-2">
                <p>{content}</p>
              </div>
            {:else}
              <span class="text-sm">모레미</span>
              <div class="bg-gray-100 font-semibold text-lg text-black rounded-xl px-4 py-2">
                {#if type == "image"}
                  <img src={content} class="w-64" alt="이미지">
                {:else}
                  <p>{content}</p>
                {/if}

                {#if type == "selection"}
                  <div class="flex flex-col mt-2 space-y-2">
                    {#each choice as option}
                      <button class="min-w-64 bg-gray-300 font-normal px-4 py-2 rounded-lg" on:click={() => {
                        pushMessage(true, option, "text");
                        //pushMessage(false, response[choice.indexOf(option)], "text");
                      }}>{option}</button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
      </div>
  
    </div>
  </div>
