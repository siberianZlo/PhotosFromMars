const marsRoverPhoto = {
    dataSelectedCalendar: '',
    apiKey: 'viz0LeYLCnoXslVAizr7D4KQQfN5kSyKTDZinOJj',

    // Получаем сегодняшнюю дату
    getTodayDate() {
        const newDate = new Date();
        let todayYear = newDate.getFullYear();
        let todayMonth =+ newDate.getMonth();
        let todayDay = newDate.getDate();

        todayMonth = todayMonth + 1;

        if (todayMonth < 10) {
            todayMonth = `0${todayMonth}`;
        }

        if (todayDay < 10) {
            todayDay = `0${todayDay}`;
        }

        const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

        return todayDate; 
    },

    // получаем дату выбранную пользователем
    getCalendarDate() {
        const calendarDate = document.querySelector('#calendarDate');
        const calendarDateArr = (calendarDate.value).split('-');
        const todayDateArr = (this.getTodayDate()).split('-');

        this.dataSelectedCalendar = calendarDate.value;
        // сравниваем дату сегодня и выбранную пользователем
        if ((new Date(...todayDateArr)) >= (new Date(...calendarDateArr))) {
            console.log('дата подходит')
        }
        else {
            const message = `Марсоход не умеет перемещаться в будущее :( <br>
                Выберите другую дату`;
            this.messageDate(message);
            throw new Error('Дата не подходит')
        }
    },

    // Отправляем пользователю сообщение если нет возможности показать фото
    messageDate(message) {
        let divHint = document.querySelector('.hint-container');

        let article = document.createElement('p');
        article.innerHTML = message;
        divHint.append(article);

        // Анимация появления и скрытия подсказки
        divHint.style.transform = 'translateY(0)';
        divHint.style.opacity = '100%';

        setTimeout(()=> {
            divHint.style.transform = 'translateY(-150%)';
            divHint.style.opacity = '0%';
            divHint.removeChild(article);
        }, 5000);
    },

    // Метод реализующий открытие изображений на весь экран
    imgOpen() {
        const img = document.querySelectorAll('img');
        const myModal = document.querySelector('#myModal');
        const closeModal = document.querySelector('.close');
        const imgModal = document.querySelector('#img-modal');
        const myBody = document.querySelector('body');

        closeModal.addEventListener('click', () => {
            myModal.style.display = "none";
            myBody.style.overflowY = 'auto';
        });

        img.forEach(element => {
            element.addEventListener('click', function() {
                myModal.style.display = "block";
                imgModal.src = this.src;
                myBody.style.overflowY = 'hidden';
            })
        });
    },

    // Удаляем со страницы элементы при запросе новых фото
    deleteExcessPhoto() {
        const myDivchik = document.querySelectorAll('.content-container');
        const wrapContainer = document.querySelector('.wrap');
        if (myDivchik.length > 0) {
            myDivchik.forEach(element => {
                wrapContainer.removeChild(element);
            });
        }
    },

    // обрабатываем массив с данными и выводим на страницу
    processingData(data) {
        for (let key in data) {
            for (let i = 0; i < data[key].length; i++) {
                const stringData = data[key][i]; // одна строка с данными
                let imgSrc = stringData.img_src;
                let earthDate = stringData.earth_date;
                let nameRover = '';

                for (let k in stringData.rover) {
                    if (k == 'name') {
                        nameRover = stringData.rover[k];
                        break;
                    }
                }
                
                // создаем елементы HTML
                let divContent = document.createElement('div');
                divContent.classList.add('content-container');
                let imgContent = document.createElement('div');
                imgContent.innerHTML = `<img src="${imgSrc}" class="img-mars">`;
                                
                let nameContent = document.createElement('p');
                nameContent.textContent = `Имя марсохода: ${nameRover}`;
                                
                let dateContent = document.createElement('p');
                dateContent.textContent = `Дата снимка: ${earthDate}`;
                                
                //выводим элементы на страницу
                                
                divContent.append(imgContent);
                divContent.append(nameContent);
                divContent.append(dateContent);
                // получаем класс wrap и в него выводим все элементы
                document.querySelector('.wrap').append(divContent);
            }
        }
    },

    // Главный метод отправляющий запрос к API Nasa, и обрабатывает полученные данные
    sendRequest() {
        this.getTodayDate();
        this.getCalendarDate();
        this.deleteExcessPhoto();

        const myRequest = new XMLHttpRequest();
        myRequest.open('GET', `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${this.dataSelectedCalendar}&api_key=${this.apiKey}`);
        myRequest.send();

        myRequest.onreadystatechange = function() {
            // Запрос обработан и отправлен нам
            if (this.readyState == 4 && this.status == 200) {
                const data = JSON.parse(this.responseText);

                // Если массив с фотографиями пуст
                if (data.photos.length === 0) {
                    let message = `К сожалению марсоход не отправлял снимки в этот день :( <br>
                        Выберите другую дату`;
                    marsRoverPhoto.messageDate(message);
                }

                else {
                // Вытаскиваем нужные данные из объекта data
                    marsRoverPhoto.processingData(data)
                    marsRoverPhoto.imgOpen();
                }
            }
        }
    }
}
