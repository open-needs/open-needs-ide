Installation routine
====================

.. uml::

    @startuml
    start

    :Check needls.pythonPath specified in workspace setting;

    if (needls.pythonPath specified and valid?) then (no)

        #palegreen:repeat :Prompt inputbox to ask user to specify;
            if (user specify?) then (yes)
                :user specify python path or use default;
                :press ENTER;
                #yellow:check and validate given python path;
            else (no)
                #darkorange:press ESC;
                end

            endif

        backward:Prompt inputbox again;
        repeat while (valid?) is (no)
        ->yes;

    else (yes)

    endif

    stop
    @enduml
