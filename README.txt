See AUTHORS for authors.

When in review mode, after user press <enter> or press the card to see if 
their input matches the answer, the user can press <enter> or press the card 
again to try again. Each attempt (that flips from card front to card back)
will count as an attempt, meaning it will update the seen/correct count
in the database. Because of this, it is possible to exploit this by holding
<enter> and it will send an absurd amount of seen/correct update to the
database. We thought about making it one attempt per flashcard, but we
believe users might want to keep attempting until they get it correct. Making
it one attempt per flashcard may not be the more accurate representation, so
we decided to keep it as it is.

For our flashcard algorithm, we decided to use a random generator that picks
from the user's existing flashcard. But, to avoid getting the same flashcard
consecutively, we have our getFlashcard query to include the flashcard id of
the last flashcard. If the same flashcard gets pick, the algorithm will pick
a new one.