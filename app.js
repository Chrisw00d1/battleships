// Creating global variables
const playerTiles = document.querySelector('#player-board')
const computerTiles = document.querySelector('#computer-board')
const startButton = document.querySelector('#start')
const welcome = document.querySelector('#welcome')
const shipPlacement = document.querySelector('#shipPlacement')
const destroyer = document.querySelector('destroyer')
const width = 10
const playerTilesArray = []
const computerTilesArray = []


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
    }
  }
}

// What happens when you push the start button
startButton.addEventListener('click', () => {
  welcome.style.display = 'none'
  shipPlacement.style.display = 'block'
  // Allows the player to start placing ships
  planningMode = true
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
  const invalidPlacement = indexToAddShipsToo.some((index) => {
    return playerTilesArray[index] === undefined
  })
  if (invalidPlacement) {
    console.log('Cant be placed here')
    indexToAddShipsToo = incaseError
  } else if (checkLoopsLeftOrRight()) {
    console.log('Cant be placed here')
    indexToAddShipsToo = incaseError
  }
  indexToAddShipsToo.forEach((index) => {
    playerTilesArray[index].classList.add(shipNames[shipSizeIndex])
  })

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