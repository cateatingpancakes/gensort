# GenSort
GenSort is a sorter inspired by [this character sorter](https://honkaistarrailsorter.tumblr.com/) and the ones that came before it. It's meant to be a fully customizable sorter that can be used for any list of, say, characters from a game, or songs from an album.

# How to Use
Set a number of rounds in the parameters list and write what you want to sort in the input box, one item per line. Use `Load` to load your parameters, `Submit` to confirm your list, and start choosing.

You'll see your results when you hit the desired round number. You can see them early by hitting the `Force` button, and you may keep going after the limit if you want.

# Details
GenSort uses the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) to sort things. When you choose an option, it's as though the two "played a game" and the one you chose won, with its rating updated accordingly. The parameters that control the algorithm are `Initial Rating`, `Log Base`, `K-Factor` and `Divide By`. They act as described in the Wikipedia page.

Matchmaking tries to pair up closer-rated items by assigning each possible match a "weight" based on a [Gaussian-like](https://en.wikipedia.org/wiki/Gaussian_function) function, but you might see items with a larger rating gap on occasion. This is controlled by the `Sigma` parameter, which you can increase to get more random questions and decrease to get less random questions.

Matches may repeat, especially if you skip a lot of rounds, which might be frustrating for the undecided, so the last few matches are "forgotten" from the list of possible matches, according to the `Forget Last` parameter.

# Future
It doesn't look amazing on mobile. If you give it a style do-over, feel free to fork and merge request. I'll probably accept it and credit you.

# Notes
GenSort is different from the Tumblr character sorters, in that I don't know how those work behind the scenes. Don't expect to be asked the same questions in the same order, or get the same scores.
