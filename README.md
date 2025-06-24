# Onwards-admin-app
App for onwards administration

# bestie mo

## father

`hello`

> this is a quote <>
> yes it is
> ujujujuj


:smile: 

const hearts = ['💖', '💝', '💗', '💓', '💕'];

function animateHeart() {
    let index = 0;
    setInterval(() => {
        console.clear();
        console.log(`
        ${hearts[index % hearts.length]}
    Beating Heart!
        ${hearts[index % hearts.length]}
        `);
        index++;
    }, 500);
}

animateHeart();