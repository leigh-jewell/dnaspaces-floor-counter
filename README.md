# Cisco DNA Spaces Floor Counter

A small example web page that uses Javscript to easily extract data from [Cisco DNA Spaces](https://dnaspaces.io) via it's API to display the nunmber
of devices on each floor in a simple table. The idea is this page could help people to see if a floor is too busy.

## Getting Started
* Have a look at the Cisco DNA Spaces API over at [DevNet](https://developer.cisco.com/docs/dna-spaces/#!dna-spaces-location-cloud-api).
To get familar with the APIs available.
* Clone this repository into a directory to get the helper scripts:
```
git clone https://github.com/leigh-jewell/dnaspaces-floor-counter.git
```
### Prerequisites

* Modern Webbrowser that can run HTML5 and Javascript
* Access to the internet - https://d3js.org, https://stackpath.bootstrapcdn.com and https://dnaspaces.io
* DNA Spaces Detect and Locate API token - instructions on creating a token found [here](https://www.cisco.com/c/en/us/td/docs/wireless/cisco-dna-spaces/detectandlocate/b-cisco-cle/b-cisco-cle_chapter_0110.html).

## Running the file locally

* Simply File -> Open the index.html file in your web brower. 
* Paste in the DNA Spaces API token into the input field
* Hit Go
* Wait a few seconds (it needs to make two API calls)
* Results will be displayed in a table

## Built With

* Javascript
* Cisco DNA Spaces API

## Authors

* **Leigh Jewell** - *Initial work* - [Github](https://github.com/leigh-jewell)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks to Cisco DNA Spaces for such a great product.
* Thanks to some great Javascript examples which I was inspired with: The Definitive Guide, 7th Edition by David Flanagan Published by O'Reilly Media, Inc., 2020
