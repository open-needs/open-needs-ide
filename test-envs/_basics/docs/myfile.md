Example Markdown File
=====================


# Support need directive and role

```{req} Open-Needs IDE shall read MyST markdown directives
---
id: REQ_01
status: open
---
Open-Needs IDE shall read MyST markdown directives which are written as a code-fence block,
followed by the (custom) directive name.
The needs elements shall be linked (by ID) from other needs elements, and links to other needs elements shall be made to a navigatable link, too.
```

```{eval-rst}
.. req:: Open-Needs IDE shall read MyST markdown rst blocks
   :id: REQ_02
   :status: open

   Open-Needs IDE shall read MyST markdown directives which occur inside a
   markdown code fence block, followed by the directive name {eval-rst}.
   The needs elements shall be linked (by ID) from other needs elements, and links to other needs elements shall be made to a navigatable link, too.
```

This line shall point to the {need}:`REQ_01`.


# TODO for Implementation

* **needs.json**: Where is this needs.json and how to build needs.json from .md file??? where are .rst files located because go to definition need to jump to where those needs objects defined??

* **Markdown parsing**: parse markdown style definition of directives and roles
   * directive patterns:
      ```{directivename} arguments
      ---
      key1: val1
      key2: val2
      ---
      This is
      directive content
      ```
      or

      ```{eval-rst}
      .. {directivename}:: arguments
         :key1: val1
         :key2: val2

         This is directive content.
      ```
   * roles pattern: {need}:`need_id`

* **Features trigger**:
   * If markdown file directive pattern with {eval-rst}, then trigger is the same with .rst

   * If directive pattern starts with ```{directivenmae}, then use trigger: "{"

      * this seems not smart, because { always comes with }, kinds of messy

   * role pattern using the same trigger like .rst

