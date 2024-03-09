const DECISION_THRESHOLD = 75
const cards = document.querySelector('.cards')

let isAnimating = false
let pullDeltaX = 0

const getPersons = async () => {
    const url = `https://randomuser.me/api/?gender=male&results=9&nat=us,dk,fr,gb,es`
    const res = await fetch(url)
    const data = await res.json()
    data.results.forEach((result, idx) => {
        createPersonCard(result, idx)
    })
}

const createPersonCard = (data, id) => {
    let personImg = `https://randomuser.me/api/portraits/lego/${id}.jpg`
    let personName = data.name.first
    let personAge = data.dob.age
    console.log(personName, personAge)
    const article = document.createElement('article')
    article.innerHTML = `
        <img src="${personImg}" />
        <h2>${personName} <span>${personAge}</span></h2>
        <div class="choice nope">NOPE</div>
        <div class="choice like">LIKE</div>
`
    cards.appendChild(article)
}

function startDrag(event) {
    if (isAnimating) return

    const actualCard = event.target.closest('article')
    if (!actualCard) return

    const startX = event.pageX ?? event.touches[0].pageX

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)

    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })

    function onMove(event) {
        const currentX = event.pageX ?? event.touches[0].pageX

        pullDeltaX = currentX - startX

        if (pullDeltaX === 0) return

        isAnimating = true

        const deg = pullDeltaX / 14

        actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`

        actualCard.style.cursor = 'grabbing'

        const opacity = Math.abs(pullDeltaX) / 100
        const isRight = pullDeltaX > 0

        const choiceEl = isRight
            ? actualCard.querySelector('.choice.like')
            : actualCard.querySelector('.choice.nope')

        choiceEl.style.opacity = opacity
    }

    function onEnd(event) {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)

        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)

        const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD

        if (decisionMade) {
            const goRight = pullDeltaX >= 0

            actualCard.classList.add(goRight ? 'go-right' : 'go-left')
            actualCard.addEventListener('transitionend', () => {
                actualCard.remove()
            })
        } else {
            actualCard.classList.add('reset')
            actualCard.classList.remove('go-right', 'go-left')

            actualCard.querySelectorAll('.choice').forEach(choice => {
                choice.style.opacity = 0
            })
        }

        actualCard.addEventListener('transitionend', () => {
            actualCard.removeAttribute('style')
            actualCard.classList.remove('reset')

            pullDeltaX = 0
            isAnimating = false
        })

        actualCard
            .querySelectorAll(".choice")
            .forEach((el) => (el.style.opacity = 0));
    }
}

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })

getPersons()