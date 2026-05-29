# Plugin `number`

Display the current slide page on bottom right.

Per default, the plugin will display the current slide number in the bottom right corner of the screen.

You can change this behaviour by setting an environment variable (in `.env`) option to a different value:

```
PLUGIN_NUMBER_FORMAT="%n/%t"
```

`%n` is replaced with the current slide number and `%t` is replaced with total slides.