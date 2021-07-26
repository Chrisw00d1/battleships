### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly, Software Engineering Immersive
# Battleships

![multipleShipsBeingHit](/images/readmeImages/battleshipsGif.gif)

## Overview
The first project given to us by General Assembly. The task is to choose from a selection of grid base games and produce one in a week.


I decided to create battleships which you can play [here](https://chrisw00d1.github.io/battleships/).

### Brief
- **Render a game in the browser**
- **Design logic for winning & visually display which player won**
- **Include separate HTML / CSS / JavaScript files**
- **KISS (Keep It Simple Stupid)** 
- **DRY (Don't Repeat Yourself)**
- **Use JavaScript for DOM manipulation**
- **Deploy your game online**
- **Use semantic markup for HTML and CSS**

### Technologies used
- **HTML**
- **CSS**
- **JavaScript**
- **Github and Git**

## Creating the game

Before diving into the code I made a rough sketch of what I wanted my game to look like and where everything was going to be placed.
Once I had that sorted I broke the program down into sections to tackle one by one:

1. Creating a grid for both the player and the computer
2. Getting the player to place their ships with the ability to rotate them
3. Randomly placing the computer’s ships
4. Getting the player to fire at the computers grid
5. Getting the computer to fire back with some calculated guesses
6. Creating a win/lose condition
7. Reseting the game to be able to play again

### Setting Up The Grid

I designed the grid based on the original game where the grid is a 10 by 10.  I created a function which creates 100 div elements to be appended into section where I need them. The function applies different event listeners to the divs depending on if they are added to the computers grid or the players. The divs are then pushed into an array depending on if they belong to the computer or the player.  Each div is given an inner HTML of the index it relates to so that when a div is clicked I can get the position it lies in the array with ease. I made the inner HTML transparent so that the user cannot see the numbers.

![grid](/images/readmeImages/screenshot1.png)

### Getting the player to place their ships

I split the game into two sections of planning mode and battle mode. This way I could split the code into two sections as well so if I got any errors in one part of the game I could already limit it to a section of my code to look at. I found this to be one of the harder parts to code as bugs continued to show depending on what the user did. First, I implemented it so that the ship would always point down on the grid depending on where the user click. Before it gets displayed on the ship it is put into a function where the indexes of where the ship will be are calculated and put into an array. Each index is checked to see if there is a ship already in the index or if it goes off the grid. Each time the user clicks a new div the previous display of the ship is removed. Incase the user clicks an error the function return the previous location instead of having a blank screen again.  Once the ship has been confirmed in the chosen position, the next ship is displayed and the process repeats until the last ship. When a ship has been placed into a div then a class called ‘ship’ gets added to it.

```js
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
```

Once I had it working with with the ships pointing down I added the feature to rotate the ship around the point by pressing r. Since the grid is an array that is wrapped, the ship could be split when going though the left or right side. So another function was created to check if it was going to loop to the other side of the board.

```js
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
```

### Randomly placing the computers ships

This was a lot easier to implement as two random numbers are generated. One to pick the rotation and one to pick the index in the array to put the ship into. With these two values I am able to use the same function that was used for the player to check if the ships can be placed there. If it can’t be placed then two new numbers are generated. After each ship is placed then all the index are added to an array. This array contains the location of all the ships and is used for determining if a ship has been destroyed.

```js
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
  } 
```

### Getting the user to shoot

Now all the ships have been placed the game is now in “battle mode”. This means the computer’s divs can be selected where a check is made to see if the player has shot at that selected div already and then to confirm the shot. If the div contains the class ‘ship’ then the grid displays a hit or a miss if there is no ship. After a ship has been hit then another check is made to see if the ship has been destroyed. This loops through all the indexes the ship is in and if all of them are hit then a message can be displayed to show which ship has been sunk.

```js
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
```

### Calculating the computer’s shot

Since the smallest  ship has a size of two it means the grid can be viewed like a chess board instead. So every other div needs to be shot at instead of all of them and you are still guaranteed to hit all of the ships. This reduces the number of random shots from 100 to 50.

```js
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
```

```js
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
```

If one of the random shots hit a ship then the index of that ship is added to an array which contains all the hit locations. Then the computer will look to make a shot from the most recent shot landed. If it cannot make a new shot it will go back to the previous hit location and see if there are any more shots it can make from that location. The challenge was how the computer will be able to differentiate between two different ships. Using the function that detects when a ship has been sunk, the index of the sunk ship can be used to filter out the indexes from the list that contains all the hits. This means that all that will remain in the array is indexes of ships that have been hit and not sunk.  An example of this is shown below.

![multipleShipsBeingHit](/images/readmeImages/screenshot7.png)

### Creating a condition to end the game and rest it

I just created two variables either containing the computer’s score or the player’s score. Every time a ship is hit the the score gets increased by one. The first one to get to 17 hits is the winner. This ends the battle mode. When the player hits play again then the game resets all the relevant variables and displays the start screen again.

## Additional content

I was able to get this done with a few days to spare thanks to preplanning the steps required and writing some pseudo code out for it. I was happy with reaching a game that was playable and wanted to focus on improving the visuals and adding sound before trying to do things like improving the computer’s shot process further.

### Visuals and sounds

This took a lot longer than I anticipated as it involved a lot of trial and error when deciding on a design to go for. I wanted the information about the game to be continuously updated as the game was playing which meant that I had to create a lot more DOM elements to display what I wanted. As the game is quite static I wanted add some kind of motion to it. Getting the radar to rotate and display took long time and a lot of attempts to get it acting in a way I am happy with. I also changed how the text gets displayed by making it appear one letter at a time to give it the effect that it is being typed. 
I combined some sound of a keyboard being typed to enhance this effect. I also added some background music and sound effects of bombs hitting with the option of turning both off incase the player doesn’t want to listen to it.

![radar](/images/readmeImages/screenshot8.png)

### Instructions

When getting other people to play it made it apparent to me that I need to add a feature that explains to the play how to play if they don’t already know. With this I am able to better explain how the planning and battle mode both work as well as explain the objective of the game.

## Conclusion

Overall I am really happy with the outcome of this project. I was able to achieve my main goal of getting it working and improving the visuals of it. I got a lot of experience on how to approach a larger project and how to break it down into reasonable steps. I’m glad I focused on getting the game to work before I focused on what the game looks like as that can take up a lot of time.

### Wins and Challenges

I think one of my wins for this project was how I planned it out. I made sure that I had a clear plan for everything I wanted it to do and pseudo coded some of the confusing parts of the code, like how the computer fires, to make sure it made sense before applying it. I was also happy with the visuals by the end of it and getting the radar to work.

Some of the main challenges I encountered came with placing the ship. I found that there were many ways to break the game so that ships would overlap or would not be placed at all but would still allow the user to move onto the next phase. This took up most of my time as if I found one of these issues later on then it took longer to fix as I had to update the new code I had written as well.

### Bugs

- **Sound issues where sometimes the audio doesn't play**
- **At a smaller screen size the game does not load correctly**

### Lessons learned

I realised that I was too focused on the idea that the user was going to have all their ships next to each other. This lead to me being very focused having the computer firing in a certain way. After testing the game I realised that it didn't perform well in the 
the situations where the ships were isolated. I know realise that I need to consider all possible outcomes plan for that.

### Future improvements

- **Ability to play it on mobile**
- **Improve the computer’s shooting**
- **Improve the visuals of the boats so they are not just squares on the grid**
- **Give an option to play against a computer or another person**
- **Improve the sounds so that they don’t cut out or are skipped**

## Screenshots of the game

![planningMode](/images/readmeImages/screenshot9.png)
![battleMode](/images/readmeImages/screenshot10.png)
![howToPlay](/images/readmeImages/screenshot11.png)