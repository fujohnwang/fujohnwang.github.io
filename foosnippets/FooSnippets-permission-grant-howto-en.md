% FooSnippets First-Time Authorization Guide
% Wang Fuqiang
% 2026-02-12

Since [FooSnippets](https://foosnippets.afoo.me/) needs to monitor keyboard events to automatically trigger keyword replacement and expansion, you must grant it the necessary permissions after installation.

While I intended to make this authorization process simple for users, I discovered through personal use that the authorization paths differ between macOS systems running on Apple Silicon versus Intel chips. This is mainly due to differences in the installation path of FooSnippets.

Therefore, I have compiled this document to help users understand how to correctly grant authorization on different macOS systems.

After installing FooSnippets from the [App Store](https://apps.apple.com/us/app/foosnippets/id6758233050?mt=12) and opening it for the first time, you should see the interface below:

![](./images/0c67a394ade89d1a10ab2419e27bf3ce.jpg)

Click the button shown in the image to begin authorization. This will open the `System Settings -> Privacy & Security -> Accessibility` interface:

![](./images/fc8077f5924eae299c1391bfc0b17cc1.jpg)

Click the ➕ sign indicated by arrow 2 (to select the application to authorize, i.e., FooSnippets). The system will prompt you to enter your current user password (or use Touch ID if available):

![](./images/9f4e45bfdd9c51cc184975c731212f5f.jpg)

Once entered, an application selection dialog box will appear, opening the `/Applications` directory:

![](./images/e0c2ea335bad553b808935e6c857b288.jpg)

Here lies the key difference between macOS systems on Apple Silicon and Intel chips:

1.  **Apple Silicon macOS:** FooSnippets is installed directly under the `/Applications` root path. Simply select `FooSnippets.app`.
2.  **Intel-based macOS:** FooSnippets is installed in a `FooSnippets` subdirectory under the `/Applications` root path. You need to navigate into the `FooSnippets` folder and then select `FooSnippets.app`, as shown below:

    - ![](./images/e0c2ea335bad553b808935e6c857b288.jpg)
    - ![](./images/e00183be730bbf6fe1fabc20d4ecf01a.jpg)

Regardless of the macOS system, as long as you select the correct `FooSnippets.app` file, FooSnippets will automatically detect that authorization was successful in the background:

![](./images/f05e98dc28609ff98436901f99a5aa6f.jpg)

Click the "Done" button, and the entire authorization process is successfully complete.

Now, we can add our own snippets and start using the app.

For example, let's add a snippet for quickly inputting the date and time:

![](./images/0a09b46bc6c2aee404d8a1d0ba193dc9.jpg)

After saving, type "dt`" in any text editor or chat input box. FooSnippets will automatically replace the input with the current date and time, for example: -> 2026-02-12 13:50:59

Of course, this is just the simplest text replacement and expansion. FooSnippets offers many more placeholder options. I look forward to you discovering more surprises in the FooSnippets settings! 🤪