# ML feed

ML feed is a Visual Studio Code extension that allows you to perform REST calls in a Notebook interface.

![Example of ML feed notebook that REST calls made to an Express App](docs/images/express-app.png)

## Features

- Create and run REST Calls within cells.
- Organize multiple REST Calls within one file.
- Intermingle markdown for documenting your calls.
- View rich HTML and image responses directly inside the Notebook.
- Optionally use the Interactive Window interface.
- Basic Authentication.
- Use data from one call in the next.
- Save API keys and other sensitive information outside of the Notebook to use securely in calls.

## Requirements

Must be using the latest version of Visual Studio Code Insiders edition.

## Usage

1. Create a new file to store your REST Calls with a `.mlfeed` ending.
![New file creation](docs/images/new-file.gif)
You can also use the command: `ML feed: Create a new blank REST Notebook`.
![New file command](docs/images/new-file-command.gif)
1. Add a code cell by hovering over the middle of the Notebook and clicking the `+ Code`
1. Add your intended URL as the first line of the cell. By default without specifying a method, it will be a GET call.
![Making a call to my Express Server](docs/images/make-call.gif)

To use the Interactive Window interface:
1. Run the command: `ML feed: Create an Interactive Window`
1. Enter your line(s) into the input field at the bottom of the window.
1. Click the adjacent button to run them.
1. Repeat.

### Changing output view to rich rendered HTML or rich JSON view

To toggle between the different views for the results of calls you can change mimetype like so:
![Using mimetype picker to change mimetype for a different output view](docs/images/change-mimetype.gif)

## More examples

```javascript
google.com
```

is equivalent to:

```javascript
GET google.com
```

### Parameters

In subsequent lines immediately following the first line add any parameters or queries starting with `?` or `&` like this:

```javascript
GET https://www.google.com
    ?query="fun"
    &page=2
```

### Headers

In the lines following without an empty line will be considered as the Request Headers:

```javascript
GET https://www.google.com
    ?query="fun"
    &page=2
User-Agent: ml-feed
Content-Type: application/json 
```

### Bodies

The last lines after a new line separator is the body of the call. Like the following:

```javascript
POST https://www.myapi.com
User-Agent: ml-feed
Content-Type: application/json 

{
    name: "Foo",
    text: "Foo is the most bar of the Foos" 
}
```

Or you can load the body from another file like so:

```javascript
POST https://www.myapi.com
User-Agent: ml-feed
Content-Type: application/json 

./body.txt
```

## Variables

You can also assign the responses from calls to a variable and use the data from that response in future calls. To do this you would just declare a variable with `let` and the name of your variable and then a `=` like so:

```javascript
let foo = GET google.com
```

And then in future cells you can reference `foo` in your calls with a `$` sign. Here's a short example:
![Example of someone declaring foo to be the response of a GET call to google.com and then creating a new cell after and seeing the auto-complete suggestions for foo.](docs/images/cross-cell-variable.gif)

## Using API keys and other secrets

If you'd like to use secret information in your calls like API keys but you don't want to use and save the raw text of these keys in the REST Notebooks, you can use secrets to save and access API keys.

To save secrets, look for the command `ML feed: Secrets` in the command palette with Cmd+Shift+P (MacOS) or Ctrl+Shift+P (Windows). Add a new secret and a name for that secret.

Then when use your secrets in your calls using the `$SECRETS` variable. In this example I'm saving a secret with the name `mySecret` and then accessing this secret to send to my Express server with `$SECRETS.mySecret`. You can see my server received my secret value of "hooray" correctly but the secret text is not visible anywhere in the Notebook.

![Example of saving and using secrets in calls](docs/images/secrets.gif)

And you can see that the actual secret is not saved in the results of the call. Every place that used a secret will be replaced by `[Secret <secret name>]`; this is for all parameters, headers, and bodies sent. Here you can see that my secret text "hooray" was replaced by `[Secret mySecret]` in the view of the request I sent.

![Example of mySecret hidden](docs/images/secret-hidden.gif)

To test these interactions, you can play around with this simple server: [SandboxServer](https://github.com/tanhakabir/SandboxServer)

## Known Issues

Unable to save responses. This should be fixed soon in the next few versions of VS Code Insiders.

## Any Other issues

Please submit your issue on the [tanhakabir/ml-feed](https://github.com/tanhakabir/ml-feed) repository with exact reproduction steps.
