# MuVis
A tool to create beautiful musical visualisations. Inspired by the amazing animations on [Musanim](https://www.youtube.com/c/musanim).

## Basic concept
MuVis lets you import the musical notes from a MIDI file, divided into different voices, and lets you assign different types of animations to each voice.
It provides a WYSIWYG view that shows you the final result as you make changes.

It has a tool to synchronize the music from the MIDI file to an existing audio source for the same piece of music on YouTube.
This allows you to exactly match the animation to the music.

The resulting project can be saved and loaded as a JSON file. The application also keeps track of your edit history, allowing you to undo and redo changes.

## Getting started
The project is entirely made up of static JavaScript, HTML and CSS. After cloning the repo, all you need to do is open index.html in your browser. 
You can also open the application on [https://sytzez.github.io/muvis/](https://sytzez.github.io/muvis/). I have mainly tested it on Google Chrome.

## Technology
I used React to render the UI, with Redux to store the state of the project and allow redoing and undoing operations. 
This state (a cleaned up version) is also used to store the project as a JSON file.
The visuals are created using WebGL with GLSL (the GL shading language).

## The File view
In this view you can start a new project, load data from a MIDI file, load/save a project from/to a JSON file or open one of the example projects.

The following example projects are available:

### 1. Prelude from Tristan und Isolde (Richard Wagner, 1857-59)

![](/tristan.png)

The prelude from [Wagner](https://en.wikipedia.org/wiki/Richard_Wagner)'s opera [Tristan und Isolde](https://en.wikipedia.org/wiki/Tristan_und_Isolde),
containing the famous [Tristan chord](https://en.wikipedia.org/wiki/Tristan_chord).

The animation is sober, soft, and slow, matching the yearning, ghostly mood and soft orchestral sound of the piece. 
It uses the *blob* note shape, a *uniform* color for all voices, the *float* note-to-note connection, the *flash* light-up mode, and a slow scrolling speed.

### 2. Kyrie from Messa de Nostra Dame (Guillaume de Machault, 14th century)

![](/kyrie.png)

The first movement from the [Messa de Nostre Dame](https://en.wikipedia.org/wiki/Messe_de_Nostre_Dame) by [Machault](https://en.wikipedia.org/wiki/Guillaume_de_Machaut).
A medieval masterpiece.

The visualisation highlights the 4 voice polyphony of the piece, each voice being drawn in a different color.

### 3. Gavotte et Six Doubles (Jean-Philippe Rameau, 1706)
***Note: The YouTube video is not available anymore***

![](/variations.png)

The final movement from [Rameau](https://en.wikipedia.org/wiki/Jean-Philippe_Rameau)'s 
[keyboard suite in A minor (RCT 5)](https://en.wikipedia.org/wiki/Pi%C3%A8ces_de_Clavecin#Suite_in_A_minor,_RCT_5).
It is a [theme with variations](https://www.musictheoryacademy.com/understanding-music/theme-and-variations/), which each variation becoming increasingly intense.

The base melody is highlighted by the animation in each variation, showing the same melody on every variation, while the actual music keeps changing.
The two layers of animation contract eachother, the repeating melody being soft and moving slowly behind the fast and pointy variations.

## The Note Editor

![](/note-editor.png)

Here you can edit, delete and add notes. You can apply these operations to multiple notes at once by selecting multiple notes. 
You can assign *brushes* to notes, which gives you the ability to add different animation styles to specific notes.
You can also assign *voices* to notes, which gives them a different color if color based on voice is used.
All operations are undoable and redoable.
By changing the play position, you can see what the animation will look like at a specific moment, by looking at the preview in the bottom left corner.

On the right panel you can change the style of animation for the selected brush, the color of the selected voice, or some details about the whole piece.

## The Time Syncher

![](/time-syncher.png)

This graph allows you to synch the visual notes to the audio in the YouTube video. 
The horizontal axis represents the time in the YouTube video, the vertical axis the time in the MIDI notes.
By adding points to the graph, you can map these two times to eachother.
Like in the Note Editor, you can change the play position to see a preview at the current moment, allowing you to accurately synch the audio and video.

On the bottom right, there are some tools to zoom in/out per dimension.

## The Preview view

A large view of the resulting animation.

![](/final.png)



