"use strict";
var fluid = require("infusion");

fluid.defaults("my.schemaHolder", {
    gradeNames: ["fluid.component"],
    schema: {
        $schema: "gss-v7-full#"
    }
});

fluid.defaults("my.book", {
    gradeNames: ["my.schemaHolder"],
    schema: {
        properties: {
            title: {
                type: "string"
            },
            description: {
                type: "string"
            },
            author: {
                type: "string"
            }
        }
    }
});

fluid.defaults("my.library", {
    gradeNames: ["my.schemaHolder"],
    schema: {
        properties: {
            checkedOut: {
                type: "array",
                items: "{book}.options.schema"
            },
            available: {
                type: "array",
                items: "{book}.options.schema"
            },
            onOrder: {
                type: "array",
                items: "{book}.options.schema"
            }
        }
    },
    components: {
        book: {
            type: "my.book",
            options: {
                schema: {
                    properties: {
                        serialNumber: { type: "integer" }
                    }
                }
            }
        }
    }
});

fluid.defaults("my.shelf", {
    gradeNames: ["my.schemaHolder"],
    schema: {
        properties: {
            books: {
                type: "array",
                items: "{book}.options.schema"
            }
        }
    },
    components: {
        book: {
            type: "my.book"
        }

    }
});

fluid.defaults("my.bookcase", {
    gradeNames: ["my.schemaHolder"],
    schema: {
        properties: {
            shelves: {
                type: "array",
                items: "{shelf}.options.schema"
            }
        }
    },
    components: {
        shelf: {
            type: "my.shelf"
        }
    }
});
