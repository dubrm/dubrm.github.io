/*
########################### TURBOLUDIK #############################
This is a JS script for telling interactive stories that mix texts,
pictures, videos, and sounds. It allows creators to focus on writing
and visual quality rather than code.
                                                Mathis Dubrul (2015)
                                          GNU General Public License
*/
/*global alert*/
/*global markdown*/
/*global position*/
(function () {
    "use strict";
    
    /****************** Optimal size *******************/
    function resize_section(section, media) {
        var ratio = media.offsetWidth / media.offsetHeight;
        if (window.innerWidth * media.offsetHeight /
                media.offsetWidth <= window.innerHeight) { //Full width
            section.style.width = window.innerWidth + 'px';
            section.style.height = window.innerWidth *
                media.offsetHeight / media.offsetWidth + 'px';
        } else { //Full height
            section.style.height = window.innerHeight + 'px';
            section.style.width = window.innerHeight *
                media.offsetWidth / media.offsetHeight + 'px';
        }
    }
    
    function resize_media(media) {
        media.style.width = '100%';
        media.style.height = '100%';
    }
    
    function optimal_size(section) {
        var img = section.getElementsByTagName('img')[0],
            video = section.getElementsByTagName('video')[0],
            media;
        if (section.getElementsByTagName('video')[0]) {
            media = section.getElementsByTagName('video')[0];
            media.addEventListener('canplay', //when video is loaded
                function () {
                    resize_section(section, media);
                    resize_media(media); //Video take full place
                    if (section.getElementsByTagName('img')[0]) { //if fallback img
                        resize_media(section.getElementsByTagName('img')[0]);//Img take full place
                    }
                }, false);
        } else if (section.getElementsByTagName('img')[0]) {
            media = section.getElementsByTagName('img')[0];
            media.addEventListener('load', //when image is loaded
                             function () {
                    resize_section(section, media);
                    resize_media(media); //Image take full place
                }, false);
        }
    }
    
    
    /******************** Popups ***********************/
    function newpopup(title, content, wait) {
        var popup = document.createElement('div');
        popup.innerHTML = '<h1>' + title + '</h1>';
        if (wait === true) { //Circles animation
            popup.innerHTML += '<div class="circles"><span class="circle"></span><span class="circle"></span><span class="circle"></span></div>';
        }
        popup.innerHTML += '<p>' + content + '</p>';
        popup.className = 'popup active';
        document.body.appendChild(popup);
        return popup;
    }
    function closepopup(popup) {
        popup.setAttribute('class', 'popup');
        //Remove the node after the smooth deasapearence
        setTimeout(function () {
            document.body.removeChild(popup);
        }, 1000);
    }
    
    /********************* Go to ***********************/
    
    function goto(step, delay) {
        var hash = location.hash;
        if (delay) {
            setTimeout(function () {
                if (location.hash === hash) {
                    location.hash = '#' + step;
                }
            }, delay * 1000);
        }
    }
    
    /********* Add text/picture/video/audio *************/
    
    /*Text*/
    function add_text(text) {
        var child = document.createElement('div');
        child.innerHTML = markdown.toHTML(text);
        child.className = 'text';
        return child;
    }
    
    /*Picture*/
    function add_image(src) {
        var child = document.createElement('img');
        child.setAttribute('src', src);
        return child;
    }
    
    function add_video(video) {
        var child = document.createElement('video'),
            html_string = '',
            mime;
        for (mime in video) {
            if (video.hasOwnProperty(mime)) {
                html_string += '<source src="' + video[mime]
                    + '" type="video/' + mime + '"/>';
            }
        }
        child.innerHTML = html_string;
        child.setAttribute('autoplay', true);
        child.setAttribute('loop', true);
        return child;
    }
    
    /*Audio*/
    function add_audio(audio) {
        var child = document.createElement('audio'),
            html_string = '',
            mime;
        for (mime in audio) {
            if (audio.hasOwnProperty(mime)) {
                html_string += '<source src="' + audio[mime]
                    + '" type="audio/' + mime + '"/>';
            }
        }
        child.innerHTML = html_string;
        child.setAttribute('autoplay', true);
        child.setAttribute('loop', true);
        return child;
    }
    
    /**************** Multiple choice *****************/
    function add_choices(choices) {
        var child = document.createElement('ul'),
            button,
            i;
        for (i = 0; i < choices.length; i += 1) {
            if (typeof choices[i].goto === 'string' &&
                    typeof choices[i].text === 'string') {
                button = document.createElement('li');
                button.innerHTML = '<a href="#' +
                    choices[i].goto + '">' + choices[i].text +
                    '</a>';
                if (typeof choices[i].x === 'number' &&
                        typeof choices[i].y === 'number') {
                    button.style.position = 'absolute';
                    button.style.left = choices[i].x + '%';
                    button.style.top = choices[i].y + '%';
                    button.style.zIndex = 3;
                }
                child.appendChild(button);
            }
        }
        child.className = 'choices';
        return child;
    }
    
    
    /****************** Load a step *******************/
    function load(step, story) {
        var section, error;
        //Be sure that <body> is empty
        document.body.innerHTML = '';
        if (typeof story[step] === 'object') {
            
            //Create a new section
            section = document.createElement('section');
            section.className = 'step';
            section.setAttribute('id', step);

            //loading text
            if (typeof story[step].text === 'string') {
                section.appendChild(add_text(story[step].text));
            }

            //loading image
            if (typeof story[step].image === 'string') {
                section.appendChild(add_image(story[step].image));
            }
            
            //loading video
            if (typeof story[step].video === 'object') {
                section.appendChild(add_video(story[step].video));
            }
 
            //loading audio
            if (typeof story[step].audio === 'object') {
                section.appendChild(add_audio(story[step].audio));
            }
            
            //loading Multiple-choice
            if (typeof story[step].choices === 'object') {
                section.appendChild(add_choices(story[step].choices));
            }
            
            optimal_size(section);
            document.body.appendChild(section);
            
            //Step duration
            if (typeof story[step].duration === 'number' && typeof story[step].next === 'string') {
                goto(story[step].next, story[step].duration);
            }
            
        } else {
            error = newpopup('Error !',
                             'There is no step called <code>' +
                             step + '</code>.',
                             false);
        }
        return section;
    }
    
    
    /********************* Init *********************/
    function init() {
        var story, req = new XMLHttpRequest(), popup, hash = '', section;
        
        popup = document.getElementById('home-popup');
        
        //Ajax
        req.open("GET", 'story.json', true);
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                //When we got the file, we try to parse it
                try {
                    story = JSON.parse(req.responseText);
                    if (typeof story.title === 'string') {
                        document.title =
                            story.title + ' - turboludik';
                    }

                    //Looking for changes in #anchors
                    setInterval(function () {
                        if (location.hash !== hash) {
                            //Update step value
                            hash = location.hash;
                            closepopup(popup);
                            //Then call load() function
                            setTimeout(function () {
                                load(hash.substr(1, hash.length),
                                     story);
                            }, 1000);
                        }
                    },
                        100);
                    
                    if (location.hash === '') {
                        //The first step is always 'home'
                        location.hash = '#home';
                    }

                } catch (e) {
                    //If we can't parse the 'story.json' file
                    closepopup(popup);
                    setTimeout(function () {
                        popup = newpopup('Error !',
                                        '<code>' + e + '</code>',
                                        false);
                    }, 1000);
                }
            }
        };
        req.send(null);
    }
    
    
    
    init();
}());