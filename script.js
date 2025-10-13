const API_URL="http://localhost:8000/todos"
const 標題欄 = document.querySelector(".標題欄");
const 描述欄 = document.querySelector(".描述欄");
const 清單=document.querySelector(".清單");
const 按鈕=document.querySelector(".按鈕");

async function 新任務(){
    const 標題=標題欄.value.trim();
    const 描述=描述欄.value.trim();

    if(!標題){
        alert("標題不能為空白");
        return;
    }
    try{
        const 回覆=await fetch(API_URL,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                title:標題,
                description:描述,
                completed:false
            })
        });
        if(!回覆.ok){
            throw new Error("新增失敗");
        }
        const 任務資料=await 回覆.json();
        加入清單項目(任務資料);
        標題欄.value="";
        描述欄.value="";
        }catch(error){
            alert(error.message);
        }
    }
    
    function 加入清單項目(任務資料){
        const 任務=document.createElement("li");
        任務.dataset.id=任務資料.id;
        任務.innerHTML=`
            <input type="checkbox" class="打勾方塊" ${任務資料.completed ? "checked":""}>
            <label><strong>${任務資料.title}</strong>-${任務資料.description}</label>
            <button class="垃圾桶">🗑️</button>
        `;
        if(任務資料.completed){
            任務.style.textDecoration="line-through";
            任務.style.color="#999";
            清單.append(任務);
        }else{
            清單.prepend(任務);
        }
        const 垃圾桶=任務.querySelector(".垃圾桶");
        const 打勾方塊=任務.querySelector(".打勾方塊");

        垃圾桶.addEventListener("click",async function(){
            try{
                const 回覆=await fetch(`${API_URL}/${任務資料.id}`,{
                    method:"DELETE"
                });
                if(!回覆.ok)throw new Error("刪除失敗");
                任務.remove();
            }catch(error){
                alert(error.message);
            }
        });
        打勾方塊.addEventListener("change",async function(){
            try{
                const 完成=打勾方塊.checked;
                const 回覆=await fetch(`${API_URL}/${任務資料.id}`,{
                    method:"PATCH",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({completed:完成})
                });
                if(!回覆.ok)throw new Error("更新失敗");

                if(完成){
                    任務.style.textDecoration="line-through";
                    任務.style.color="#999";
                    清單.append(任務);
                }else{
                    任務.style.textDecoration="none";
                    任務.style.color="";
                    清單.prepend(任務);
                }
            }catch(error){
                alert(error.message);
            }
        });
}
按鈕.addEventListener("click",新任務);

標題欄.addEventListener("keyup",function(e){
    if(e.key==="Enter"){
        新任務();
    }
});
描述欄.addEventListener("keyup",function(e){
    if(e.key==="Enter"){
        新任務();
    }
});
async function 載入任務(){
    try{
        const 回覆=await fetch(API_URL);
        if(!回覆.ok)throw new Error("載入清單失敗");
        const 任務清單=await 回覆.json();
        任務清單.forEach(加入清單項目);
        alert("後端連線成功，任務載入完成！");
    }catch(error){
        alert(error.message);
    }
}
document.addEventListener("DOMContentLoaded",載入任務);