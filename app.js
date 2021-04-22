// Creating global variables
const playerTiles = document.querySelector('#player-board')
const computerTiles = document.querySelector('#computer-board')
const startButton = document.querySelector('#start')
// sound
const keyboardSound = document.querySelector('#keyboard')
const backgroundMusic = document.querySelector('#background')
const hitSound = document.querySelector('#hitSound')
const missSound = document.querySelector('#missSound')
const soundButton = document.querySelector('#soundButton')
const musicButton = document.querySelector('#musicButton')
// 
// displays in the information
const welcome = document.querySelector('#welcome')
const howToPlay = document.querySelector('#howToPlay')
const closeDisplay = document.querySelector('#close')
const howToDisplay = document.querySelector('#howToDisplay')
// info for ship placement
const shipPlacement = document.querySelector('#shipPlacement')
const shipShownInInfo = document.querySelector('.shipShown')
const nameToDisplay = document.querySelector('#nameToDisplay')
const lengthToDisplay = document.querySelector('#lengthToDisplay')
const placementError = document.querySelector('#placementError')
const displayDirection = document.querySelector('#direction')
// info for battle stuff
const battleStage = document.querySelector('#battleStage')
const displayPlayShot = document.querySelector('#playerX')
const displayCompShot = document.querySelector('#computerX')
const playerHitOrMiss = document.querySelector('#playerHitOrMiss')
const computerHitOrMiss = document.querySelector('#compHitOrMiss')
const playerRadar = document.querySelector('#playerRadar')
const computerRadar = document.querySelector('#computerRadar')
// winning screen
const winningScreen = document.querySelector('#winningScreen')
const whoWon = document.querySelector('#whoWon')

const width = 10
const playerTilesArray = []
const computerTilesArray = []
let gameStarted = false


// Calls the grid funciton to make a grid on both boards
createGrid('player')
createGrid('computer')

// Player chooses where to place the ships
let planningMode = false
let shipHasBeenPlaced = false
let indexToAddShipsTo = []
const shipNames = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier']
const shipSizes = [2, 3, 3, 4, 5]
let shipSizeIndex = 0
let direction = 0
let indexWithAllPlayerShipPositions = []
let indexWithAllComputerShipPositions = []
let playerShips = true
const directions = ['Down', 'Left', 'Up', 'Right']
let nameDisplayed = false

// Creates a grid
function createGrid(grid) {
  for (let i = 0; i < width ** 2; i++) {
    const tile = document.createElement('div')
    tile.style.width = `${100 / width}%`
    tile.style.height = `${100 / width}%`
    tile.classList.add('sea')
    tile.innerHTML = i
    if (grid === 'player') {
      playerTiles.appendChild(tile)
      playerTilesArray.push(tile)
      // Adds what happends to when you click the players divs
      tile.addEventListener('click', () => {
        if (planningMode) {
          if (shipHasBeenPlaced) {
            removePreviousPlacement()
          }
          placeShip(Number(tile.innerHTML))
          shipHasBeenPlaced = true
        }
      })
    } else {
      computerTiles.appendChild(tile)
      computerTilesArray.push(tile)
      // Add what happends when you click the computers divs
      tile.addEventListener('click', () => {
        if (battleMode) {
          if (tileToShoot) {
            removePreviousSelected()
          }
          if (tile.classList.contains('hit') || tile.classList.contains('miss')) {
            // deleted code that was no longer used here
          } else {
            selectTile(Number(tile.innerHTML))
            tileToShoot = true
          }
        }
      })
    }
  }
}

// What happens when you push the start button / placement button / confirm shot button
startButton.addEventListener('click', () => {
  welcome.style.display = 'none'
  // Allows the player to start placing ships
  // confirms the placement of the ship and displays the next one that will be placed
  if (indexToAddShipsTo.length < 2) {
    shipHasBeenPlaced = false
  }
  if (shipHasBeenPlaced && planningMode) {
    shipHasBeenPlaced = false
    confirmPlacement()
    indexToAddShipsTo = []
    if (shipSizeIndex === shipSizes.length - 1) {
      startButton.innerHTML = 'Start Battle!'
    }
    // When the player has placed all their ships
    if (shipSizeIndex === shipSizes.length) {
      shipSizeIndex = 0
      playerShips = false
      placeComputerShips()
      planningMode = false
      battleMode = true
      backgroundMusic.src = './Sounds/battle.wav'
      if (musicPlaying) {
        backgroundMusic.play()
      }
      startButton.innerHTML = 'Confirm Shot'
      battleStage.style.display = 'flex'
      keyboardSound.currentTime = Math.ceil(Math.random() * 12)
      keyboardSound.play()
      animateText(('Your Radar').split(''), playerRadar, 0)
      animateText(('Computer\'s Radar').split(''), computerRadar, 0)
      playerHitOrMiss.innerHTML = ''
      computerHitOrMiss.innerHTML = ''
    }
    placementError.innerHTML = ''
    // The player hasn't placed a ship yet
  } else if (!shipHasBeenPlaced && planningMode) {
    placementError.innerHTML = 'You need to place a ship first'
  }
  if (!gameStarted) {
    gameStarted = true
    shipShownInInfo.classList.add(`${shipNames[shipSizeIndex]}Display`)
    startButton.innerHTML = 'Confirm placement'
    displayDirection.innerHTML = `Direction: <em>${directions[direction]}</em>`
  }
  // Displaying the information of the ships in the middle block
  if (!battleMode && !gameWon) {
    if (!nameDisplayed) {
      nameDisplayed = true
      keyboardSound.currentTime = Math.ceil(Math.random() * 12)
      keyboardSound.play()
      animateText((`${shipNames[shipSizeIndex]}`).split(''), nameToDisplay, 0)
      animateText((`LENGTH: ${shipSizes[shipSizeIndex]}`).split(''), lengthToDisplay, 0)
    }
    planningMode = true
    shipPlacement.style.display = 'flex'
  }
  if (gameWon) {
    resetGame()
  }
  // Confirm shot
  if (battleMode) {
    shipPlacement.style.display = 'none'
    if (tileToShoot && !shotFired) {
      shotFired = true
      makeShot('player')
      if (!gameWon) {
        // ADD COMPUTER IS WAITING HERE
        setTimeout(() => {
          keyboardSound.currentTime = Math.ceil(Math.random() * 12)
          keyboardSound.play()
          animateText(('The Computer is firing..').split(''), computerHitOrMiss, 0)
          setTimeout(() => {
            makeShot('computer')
            shotFired = false
          }, 2500)
        }, 700)

      }
    }
  }
})


// Planning Mode to place a ship with checks
function placeShip(divIndex) {
  placementError.innerHTML = ''
  const incaseError = indexToAddShipsTo
  indexToAddShipsTo = []
  indexToAddShipsTo.push(divIndex)
  for (let i = 0; i < shipSizes[shipSizeIndex] - 1; i++) {
    divIndex = rotation(divIndex)
    indexToAddShipsTo.push(divIndex)
  }
  if (playerShips) {
    const invalidPlacement = indexToAddShipsTo.some((index) => {
      return playerTilesArray[index] === undefined || playerTilesArray[index].classList.contains('ship')
    })
    if (invalidPlacement) {
      placementError.innerHTML = 'Cannot be placed here'
      indexToAddShipsTo = incaseError
    } else if (checkLoopsLeftOrRight()) {
      placementError.innerHTML = 'Cannot be placed here'
      indexToAddShipsTo = incaseError
    }
    indexToAddShipsTo.forEach((index) => {

      playerTilesArray[index].classList.add(shipNames[shipSizeIndex])
    })
  } else {
    const invalidPlacement = indexToAddShipsTo.some((index) => {
      return computerTilesArray[index] === undefined || computerTilesArray[index].classList.contains('ship')
    })
    if (invalidPlacement) {
      indexToAddShipsTo = incaseError
    } else if (checkLoopsLeftOrRight()) {
      indexToAddShipsTo = incaseError
    }
    // This code below shows the location of the computer ships comment it out to hide it for the actual game
    // indexToAddShipsTo.forEach((index) => {
    //   computerTilesArray[index].classList.add(shipNames[shipSizeIndex])
    // })
  }

}

// Adds an event to the r key
document.addEventListener('keydown', (event) => {
  const key = event.key
  if (key === 'r') {
    direction++
    if (direction === 4) {
      direction = 0
    }
    if (shipHasBeenPlaced) {
      removePreviousPlacement()
      placeShip(indexToAddShipsTo[0])
    }
    displayDirection.innerHTML = `Direction: <em>${directions[direction]}</em>`
  }
})

// Rotation function and returns which index to add to next
function rotation(divIndex) {
  // Down
  if (direction === 0) {
    divIndex += width
    // Left
  } else if (direction === 1) {
    divIndex -= 1
    // Up
  } else if (direction === 2) {
    divIndex -= width
    // Right
  } else {
    divIndex += 1
  }
  return divIndex
}

// Delete previous placement of the ship
function removePreviousPlacement() {
  indexToAddShipsTo.forEach((index) => {
    playerTilesArray[index].classList.remove(shipNames[shipSizeIndex])
  })
}

// checks to see if the ship wraps around the grid
function checkLoopsLeftOrRight(newIndex, lastIndexShotAt) {
  let wrapfound = false
  if (!battleMode) {
    let comparing = indexToAddShipsTo[0]
    for (let i = 1; i < indexToAddShipsTo.length; i++) {
      if (comparing % 10 === 0) {
        if (indexToAddShipsTo[i] === comparing - 1) {
          wrapfound = true
        }
      } else if (indexToAddShipsTo[i] % 10 === 0) {
        if (indexToAddShipsTo[i] === comparing + 1) {
          wrapfound = true
        }
      }
      comparing = indexToAddShipsTo[i]
    }
  } else {
    if ((lastIndexShotAt % 10 === 0 && newIndex === lastIndexShotAt - 1) || (newIndex % 10 === 0 && lastIndexShotAt === newIndex - 1)) {
      wrapfound = true
    }
  }

  return wrapfound
}
// function that confirms the placement of the ships
function confirmPlacement() {
  shipShownInInfo.classList.remove(`${shipNames[shipSizeIndex]}Display`)
  shipSizeIndex++
  nameDisplayed = false
  shipShownInInfo.classList.add(`${shipNames[shipSizeIndex]}Display`)
  indexWithAllPlayerShipPositions.push(indexToAddShipsTo)
  indexToAddShipsTo.forEach((index) => {
    playerTilesArray[index].classList.add('ship')
  })
}

function placeComputerShips() {
  indexToAddShipsTo = []
  direction = Math.floor(Math.random() * 4)
  const randomIndex = Math.floor(Math.random() * computerTilesArray.length)
  placeShip(randomIndex)
  if (indexToAddShipsTo.length >= 2) {
    indexToAddShipsTo.forEach((index) => {
      computerTilesArray[index].classList.add('ship')
    })
    indexWithAllComputerShipPositions.push(indexToAddShipsTo)
    shipSizeIndex++
  }
  if (shipSizeIndex < shipNames.length) {
    placeComputerShips()
  } else {
    console.log(indexWithAllComputerShipPositions, 'comp positons')
  }
}

// Adds text one at a time
function animateText(array, whereToAdd, index) {
  if (index === 0) {
    whereToAdd.innerHTML = ''
  }
  if (index < array.length) {
    whereToAdd.innerHTML += array[index]
    index++
    setTimeout(() => {
      animateText(array, whereToAdd, index)
    }, 70)
  } else {
    setTimeout(() => {
      keyboardSound.pause()
    }, 100)
  }
}

// 
// 
// Battle mode
let battleMode = false
let tileToShoot = false
let selectedTile
let playerScore = 0
let computerScore = 0
let gameWon = false
let shotFired = false
let previousHit = []

// Removes the previous selected tile by the user
function removePreviousSelected() {
  computerTilesArray[selectedTile].classList.remove('selected')
}

function selectTile(index) {
  selectedTile = index
  computerTilesArray[index].classList.add('selected')
}
// either the player or the computer makes a shot
function makeShot(shooter) {
  const cross = document.createElement('span')
  cross.innerHTML = 'X'
  if (shooter === 'player') {
    if (computerTilesArray[selectedTile].classList.contains('ship')) {
      computerTilesArray[selectedTile].classList.add('hit')
      computerTilesArray[selectedTile].appendChild(cross)
      const shipSunk = hasShipBeenDestroyed('player')
      if (shipSunk[0]) {
        displayShots('player', 'hit', shipSunk[1])
      } else {
        displayShots('player', 'hit', undefined)
      }
      playerScore++
    } else {
      computerTilesArray[selectedTile].classList.add('miss')
      computerTilesArray[selectedTile].appendChild(cross)
      displayShots('player', 'miss', undefined)
    }
    tileToShoot = false
    removePreviousSelected()
    selectedTile = null
  } else {
    computerShot(cross)
  }
  checkWin()
}
// Selects the index where the computer will shoot where 
// cross is just the span that gets added to tile picked by the computer
function computerShot(cross) {
  let randomIndex = null
  if (previousHit.length >= 1) {
    randomIndex = calculatedShot(previousHit[previousHit.length - 1], 1)
  } else {
    randomIndex = randomShot()
  }
  if (playerTilesArray[randomIndex].classList.contains('ship')) {
    playerTilesArray[randomIndex].classList.add('hit')
    playerTilesArray[randomIndex].appendChild(cross)
    previousHit.push(randomIndex)
    const playerShipSunk = hasShipBeenDestroyed('computer')
    if (playerShipSunk[0]) {
      removeSunkenShipIndex(playerShipSunk[1])
      displayShots('computer', 'hit', playerShipSunk[1])
    } else {
      displayShots('computer', 'hit', undefined)
    }
    computerScore++
  } else {
    playerTilesArray[randomIndex].classList.add('miss')
    playerTilesArray[randomIndex].appendChild(cross)
    displayShots('computer', 'miss', undefined)
  }
}

// Returns a random index for the computer to shoot at
function randomShot() {
  const randomShotIndex = Math.floor(Math.random() * playerTilesArray.length)
  let improvedRandomShot = false
  // Reduces the number of squares the computer has to hit from 100 to 50 by aiming at every other square
  if ((0 <= randomShotIndex && randomShotIndex <= 9) || (20 <= randomShotIndex && randomShotIndex  <= 29) || (40 <= randomShotIndex && randomShotIndex  <= 49) || (60 <= randomShotIndex && randomShotIndex  <= 69) || (80 <= randomShotIndex && randomShotIndex  <= 89)) {
    if (randomShotIndex % 2 !== 0) {
      improvedRandomShot = true
    }
  } else {
    if (randomShotIndex % 2 === 0) {
      improvedRandomShot = true
    }
  }
  if (playerTilesArray[randomShotIndex].classList.contains('hit') || playerTilesArray[randomShotIndex].classList.contains('miss') || !improvedRandomShot) {
    return randomShot()
  } else {
    return randomShotIndex
  }
}

// Calculates a more accurate shot for the computer
function calculatedShot(lastIndexShotAt, index) {
  for (let i = 0; i < 4; i++) {
    const newIndex = rotation(lastIndexShotAt)
    if (playerTilesArray[newIndex] !== undefined && !checkLoopsLeftOrRight(newIndex, lastIndexShotAt)) {
      if (!playerTilesArray[newIndex].classList.contains('hit') && !playerTilesArray[newIndex].classList.contains('miss')) {
        return newIndex
      }
    }
    direction++
    if (direction === 4) {
      direction = 0
    }
  }
  index++
  return calculatedShot(previousHit[previousHit.length - index], index)
}

// Checks to see if a ship has been sunk
function hasShipBeenDestroyed(user) {
  if (user === 'player') {
    user = indexWithAllComputerShipPositions
    for (let i = 0; i < shipNames.length; i++) {
      const hasBeenSunk = user[i].every((index) => {
        return computerTilesArray[index].classList.contains('hit') && !computerTilesArray[index].classList.contains('sunk')
      })
      if (hasBeenSunk) {
        user[i].forEach((index) => {
          computerTilesArray[index].classList.add('sunk')
        })
        return [true, shipNames[i]]
      }
    }
  } else {
    user = indexWithAllPlayerShipPositions
    for (let i = 0; i < shipNames.length; i++) {
      const hasBeenSunk = user[i].every((index) => {
        return playerTilesArray[index].classList.contains('hit') && !playerTilesArray[index].classList.contains('sunk')
      })
      if (hasBeenSunk) {
        user[i].forEach((index) => {
          playerTilesArray[index].classList.add('sunk')
        })
        return [true, shipNames[i]]
      }
    }
  }
  return [false]
}
// removes the index of the sunken ship from previous hit so that it does not keep looking around them
function removeSunkenShipIndex(sunkenShipName) {
  const shipNameIndex = shipNames.findIndex((name) => {
    return name === sunkenShipName
  })
  const newPreviousHit = previousHit.filter((hitIndex) => {
    let found = false
    indexWithAllPlayerShipPositions[shipNameIndex].forEach((indexOfShip) => {
      if (indexOfShip === hitIndex) {
        found = true
      }
    })
    if (!found) {
      return hitIndex
    }
  })
  previousHit = newPreviousHit
}

// Checks to see if anyone has won the game
function checkWin() {
  if (playerScore === 17 || computerScore === 17) {
    if (tileToShoot) {
      removePreviousSelected()
    }
    keyboardSound.pause()
    for (let i = 0; i < shipNames.length; i++) {
      indexWithAllComputerShipPositions[i].forEach((index) => {
        computerTilesArray[index].classList.add(`${shipNames[i]}`)
      })
    }
    gameWon = true
    battleMode = false
    battleStage.style.display = 'none'
    winningScreen.style.display = 'block'
    startButton.innerHTML = 'Play again'
    if (playerScore === 17) {
      whoWon.innerHTML = 'Congratulations!<br><br><p id="wonText">You Win! You were able to sink all the computer\'s ships</p>'
    } else {
      whoWon.innerHTML = 'You Lose<br><br><p id="wonText">All your ships were sunk. Better luck next time!</p>'
    }
  }
}
// function that displays the information into the main grid about the shots
function displayShots(user, result, ship) {
  if (user === 'player') {
    displayPlayShot.classList.remove('hit')
    displayPlayShot.classList.remove('miss')
    displayPlayShot.innerHTML = 'X'
    displayPlayShot.classList.add(`${result}`)
    keyboardSound.currentTime = Math.ceil(Math.random() * 12)
    keyboardSound.play()
    if (ship !== undefined) {
      animateText((`${result}, you sunk the ${ship}`).split(''), playerHitOrMiss, 0)

    } else {
      animateText((`${result}`).split(''), playerHitOrMiss, 0)
    }
  } else {
    displayCompShot.classList.remove('hit')
    displayCompShot.classList.remove('miss')
    displayCompShot.innerHTML = 'X'
    displayCompShot.classList.add(`${result}`)
    keyboardSound.currentTime = Math.ceil(Math.random() * 12)
    keyboardSound.play()
    if (ship !== undefined) {
      animateText((`${result}, your ${ship} was sunk`).split(''), computerHitOrMiss, 0)
    } else {
      animateText((`${result}`).split(''), computerHitOrMiss, 0)
    }
  }
  if (result === 'miss') {
    missSound.play()
  } else {
    hitSound.play()
  }
}

// function to reset the game to play again
function resetGame() {
  gameWon = false
  gameStarted = false
  winningScreen.style.display = 'none'
  welcome.style.display = 'flex'
  shipSizeIndex = 0
  playerShips = true
  indexToAddShipsTo = []
  tileToShoot = false
  shotFired = false
  playerScore = 0
  computerScore = 0
  previousHit = []
  backgroundMusic.src = './Sounds/planning.wav'
  if (musicPlaying) {
    backgroundMusic.play()
  }
  indexWithAllPlayerShipPositions = []
  indexWithAllComputerShipPositions = []
  displayPlayShot.classList.remove('hit')
  displayPlayShot.classList.remove('miss')
  displayCompShot.classList.remove('hit')
  displayCompShot.classList.remove('miss')
  const allSpan = Array.from(document.querySelectorAll('span'))
  allSpan.forEach((xSpan) => {
    xSpan.remove()
  })
  startButton.innerHTML = 'Start'
  playerTilesArray.forEach((tile) => {
    tile.classList.remove('hit')
    tile.classList.remove('miss')
    tile.classList.remove('destroyer')
    tile.classList.remove('submarine')
    tile.classList.remove('cruiser')
    tile.classList.remove('battleship')
    tile.classList.remove('carrier')
    tile.classList.remove('ship')
    tile.classList.remove('sunk')
  })
  computerTilesArray.forEach((tile) => {
    tile.classList.remove('hit')
    tile.classList.remove('miss')
    tile.classList.remove('destroyer')
    tile.classList.remove('submarine')
    tile.classList.remove('cruiser')
    tile.classList.remove('battleship')
    tile.classList.remove('carrier')
    tile.classList.remove('ship')
    tile.classList.remove('sunk')
  })
}


// Background Music
// backgroundMusic.muted = true
let musicPlaying = false
let soundStopped = true
keyboardSound.muted = soundStopped
hitSound.muted = soundStopped
missSound.muted = soundStopped
backgroundMusic.loop = true
backgroundMusic.volume = 0.03
keyboardSound.volume = 0.3

musicButton.addEventListener('click', () => {
  if (!musicPlaying) {
    musicPlaying = true
    backgroundMusic.play()
    musicButton.innerHTML = 'Music: ON'
  } else {
    musicPlaying = false
    backgroundMusic.pause()
    musicButton.innerHTML = 'Music: OFF'
  }
})

soundButton.addEventListener('click', () => {
  if (soundStopped) {
    soundStopped = false
    keyboardSound.muted = soundStopped
    hitSound.muted = soundStopped
    missSound.muted = soundStopped
    soundButton.innerHTML = 'Sound: ON'
  } else {
    soundStopped = true
    keyboardSound.muted = soundStopped
    hitSound.muted = soundStopped
    missSound.muted = soundStopped
    soundButton.innerHTML = 'Sound: OFF'
  }
})

// How to play
howToPlay.addEventListener('click', () => {
  howToDisplay.style.display = 'flex'
  setTimeout(() => {
    howToDisplay.style.opacity = 1
  }, 100)
})

closeDisplay.addEventListener('click', () => {
  howToDisplay.style.opacity = 0
  setTimeout(() => {
    howToDisplay.style.display = 'none'
  }, 2000)
})