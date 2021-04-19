// Creating global variables
const playerTiles = document.querySelector('#player-board')
const computerTiles = document.querySelector('#computer-board')
const startButton = document.querySelector('#start')
// displays in the information
const welcome = document.querySelector('#welcome')
// info for ship placement
const shipPlacement = document.querySelector('#shipPlacement')
const shipShownInInfo = document.querySelector('.shipShown')
const nameToDisplay = document.querySelector('#nameToDisplay')
const lengthToDisplay = document.querySelector('#lengthToDisplay')
const placementError = document.querySelector('#placementError')
const displayDirection = document.querySelector('#direction')
// info for battle stuff
const battleStage = document.querySelector('#battleStage')
const displayPlayShot = document.querySelector('#displayPlayShot')
const displayCompShot = document.querySelector('#displayCompShot')
const playerHitOrMiss = document.querySelector('#playerHitOrMiss')
const computerHitOrMiss = document.querySelector('#compHitOrMiss')
const computerIsFiring = document.querySelector('#computerIsFiring')
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
let indexToAddShipsToo = []
const shipNames = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier']
const shipSizes = [2, 3, 3, 4, 5]
let shipSizeIndex = 0
let direction = 0
const indexWithAllPlayerShipPositions = []
const indexWithAllComputerShipPositions = []
let playerShips = true
const directions = ['Down', 'Left', 'Up', 'Right']

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
            console.log('You have already fired here')
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
  if (indexToAddShipsToo.length < 2) {
    shipHasBeenPlaced = false
  }
  if (shipHasBeenPlaced && planningMode) {
    shipHasBeenPlaced = false
    confirmPlacement()
    indexToAddShipsToo = []
    if (shipSizeIndex === shipSizes.length - 1) {
      startButton.innerHTML = 'Confirm placement and start battle'
    }
    // When the player has placed all their ships
    if (shipSizeIndex === shipSizes.length) {
      shipSizeIndex = 0
      playerShips = false
      placeComputerShips()
      planningMode = false
      battleMode = true
      startButton.innerHTML = 'Confirm Shot'
      battleStage.style.display = 'flex'
    }
    placementError.innerHTML = ''
    // The player hasn't placed a ship yet
  } else if (!shipHasBeenPlaced && planningMode) {
    placementError.innerHTML = 'You need to place a ship first'
  }
  if (!gameStarted) {
    gameStarted = true
    shipShownInInfo.classList.add(shipNames[shipSizeIndex])
    startButton.innerHTML = 'Confirm placement'
    displayDirection.innerHTML = `Direction: ${directions[direction]}`
  }
  // Displaying the information of the ships in the middle block
  if (!battleMode && !gameWon) {
    nameToDisplay.innerHTML = `${shipNames[shipSizeIndex]}`
    lengthToDisplay.innerHTML = `LENGTH: ${shipSizes[shipSizeIndex]}`
    planningMode = true
    shipPlacement.style.display = 'flex'
  }
  // Confirm shot
  if (gameWon) {
    resetGame()
  }
  if (battleMode) {
    shipPlacement.style.display = 'none'
    if (tileToShoot && !shotFired) {
      shotFired = true
      makeShot('player')
      if (!gameWon) {
        // ADD COMPUTER IS WAITING HERE
        let intervalCounter = 0
        computerIsFiring.innerHTML = 'The Computer is firing'
        const intervalId = setInterval(() => {
          if (intervalCounter < 3) {
            computerIsFiring.innerHTML += '.'
          }
          if (intervalCounter === 3) {
            clearInterval(intervalId)
            makeShot('computer')
            computerIsFiring.innerHTML = ''
            shotFired = false
          }
          intervalCounter++
        }, 400)
      }
    }
  }
})


// Planning Mode to place a ship with checks
function placeShip(divIndex) {
  const incaseError = indexToAddShipsToo
  indexToAddShipsToo = []
  indexToAddShipsToo.push(divIndex)
  for (let i = 0; i < shipSizes[shipSizeIndex] - 1; i++) {
    divIndex = rotation(divIndex)
    indexToAddShipsToo.push(divIndex)
  }
  if (playerShips) {
    const invalidPlacement = indexToAddShipsToo.some((index) => {
      return playerTilesArray[index] === undefined || playerTilesArray[index].classList.contains('ship')
    })
    if (invalidPlacement) {
      placementError.innerHTML = 'Cannot be placed here'
      indexToAddShipsToo = incaseError
    } else if (checkLoopsLeftOrRight()) {
      placementError.innerHTML = 'Cannot be placed here'
      indexToAddShipsToo = incaseError
    }
    indexToAddShipsToo.forEach((index) => {
      playerTilesArray[index].classList.add(shipNames[shipSizeIndex])
    })
  } else {
    const invalidPlacement = indexToAddShipsToo.some((index) => {
      return computerTilesArray[index] === undefined || computerTilesArray[index].classList.contains('ship')
    })
    if (invalidPlacement) {
      indexToAddShipsToo = incaseError
    } else if (checkLoopsLeftOrRight()) {
      indexToAddShipsToo = incaseError
    }
    // This code below shows the location of the computer ships comment it out to hide it for the actual game
    indexToAddShipsToo.forEach((index) => {
      computerTilesArray[index].classList.add(shipNames[shipSizeIndex])
    })
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
      placeShip(indexToAddShipsToo[0])
    }
    displayDirection.innerHTML = `Direction: ${directions[direction]}`
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
  indexToAddShipsToo.forEach((index) => {
    playerTilesArray[index].classList.remove(shipNames[shipSizeIndex])
  })
}

// checks to see if the ship wraps around the grid
function checkLoopsLeftOrRight() {
  let comparing = indexToAddShipsToo[0]
  let wrapfound = false
  for (let i = 1; i < indexToAddShipsToo.length; i++) {
    if (comparing % 10 === 0) {
      if (indexToAddShipsToo[i] === comparing - 1) {
        wrapfound = true
      }
    } else if (indexToAddShipsToo[i] % 10 === 0) {
      if (indexToAddShipsToo[i] === comparing + 1) {
        wrapfound = true
      }
    }
    comparing = indexToAddShipsToo[i]
  }
  return wrapfound
}
// function that confirms the placement of the ships
function confirmPlacement() {
  shipShownInInfo.classList.remove(shipNames[shipSizeIndex])
  shipSizeIndex++
  shipShownInInfo.classList.add(shipNames[shipSizeIndex])
  indexWithAllPlayerShipPositions.push(indexToAddShipsToo)
  indexToAddShipsToo.forEach((index) => {
    playerTilesArray[index].classList.add('ship')
  })
}

function placeComputerShips() {
  indexToAddShipsToo = []
  direction = Math.floor(Math.random() * 4)
  const randomIndex = Math.floor(Math.random() * computerTilesArray.length)
  placeShip(randomIndex)
  if (indexToAddShipsToo.length >= 2) {
    indexToAddShipsToo.forEach((index) => {
      computerTilesArray[index].classList.add('ship')
    })
    indexWithAllComputerShipPositions.push(indexToAddShipsToo)
    shipSizeIndex++
  }
  if (shipSizeIndex < shipNames.length) {
    placeComputerShips()
  } else {
    console.log(indexWithAllComputerShipPositions, 'comp positons')
  }
}


// Battle mode
let battleMode = false
let tileToShoot = false
let selectedTile
let playerScore = 0
let computerScore = 0
let gameWon = false
let shotFired = false

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
      displayShots('player', 'hit')
      playerScore++
    } else {
      computerTilesArray[selectedTile].classList.add('miss')
      computerTilesArray[selectedTile].appendChild(cross)
      displayShots('player', 'miss')
    }
    tileToShoot = false
    removePreviousSelected()
    selectedTile = null
  } else {
    computerShot(cross)
  }
  checkWin()
}
// Selects the index where the computer will shoot
function computerShot(cross) {
  const randomShotIndex = Math.floor(Math.random() * playerTilesArray.length)
  if (playerTilesArray[randomShotIndex].classList.contains('hit') || playerTilesArray[randomShotIndex].classList.contains('miss')) {
    computerShot(cross)
  } else {
    if (playerTilesArray[randomShotIndex].classList.contains('ship')) {
      playerTilesArray[randomShotIndex].classList.add('hit')
      playerTilesArray[randomShotIndex].appendChild(cross)
      displayShots('computer', 'hit')
      computerScore++
    } else {
      playerTilesArray[randomShotIndex].classList.add('miss')
      playerTilesArray[randomShotIndex].appendChild(cross)
      displayShots('computer', 'miss')
    }
  }
}
// Checks to see if anyone has won the game
function checkWin() {
  if (playerScore === 17 || computerScore === 17) {
    gameWon = true
    battleMode = false
    battleStage.style.display = 'none'
    winningScreen.style.display = 'block'
    startButton.innerHTML = 'Play again'
    if (playerScore === 17) {
      whoWon.innerHTML = 'You Win!'
    } else {
      whoWon.innerHTML = 'You Lose!'
    }
  }
}
// function that displays the information into the main grid about the shots
function displayShots(user, result) {
  if (user === 'player') {
    displayPlayShot.classList.remove('hit')
    displayPlayShot.classList.remove('miss')
    displayPlayShot.innerHTML = 'X'
    displayPlayShot.classList.add(`${result}`)
    playerHitOrMiss.innerHTML = `${result}`
  } else {
    displayCompShot.classList.remove('hit')
    displayCompShot.classList.remove('miss')
    displayCompShot.innerHTML = 'X'
    displayCompShot.classList.add(`${result}`)
    computerHitOrMiss.innerHTML = `${result}`
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
  indexToAddShipsToo = []
  tileToShoot = false
  shotFired = false
  playerScore = 0
  computerScore = 0
  displayPlayShot.innerHTML = ''
  displayCompShot.innerHTML = ''
  const allSpan = Array.from(document.querySelectorAll('span'))
  allSpan.forEach((xSpan) => {
    xSpan.remove()
  })
  displayPlayShot.innerHTML = ''
  displayCompShot.innerHTML = ''
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
  })
}