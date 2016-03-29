declare module 'valid-url' {
    /*
     * @Function isUri(value)
     *
     * @Synopsis  is the value a well-formed uri?
     * @Description
     * Returns the untainted URI if the test value appears to be well-formed.  Note that
     * you may really want one of the more practical methods like is_http_uri or is_https_uri,
     * since the URI standard (RFC 3986) allows a lot of things you probably don't want.
     * @Arguments
     *   value  The potential URI to test.
     *
     * @Returns The untainted RFC 3986 URI on success, undefined on failure.
     * @Notes
     *  This function does not make any attempt to check whether the URI is accessible
     *  or 'makes sense' in any meaningful way.  It just checks that it is formatted
     *  correctly.
     *
     */
    export function isUri(value: string): boolean;

    /*
     * @Function isHttpUri(value)
     * @Synopsis   is the value a well-formed HTTP uri?
     * @Description
     * Specialized version of isUri() that only likes http:// urls.  As a result, it can
     * also do a much more thorough job validating.  Also, unlike isUri() it is more
     * concerned with only allowing real-world URIs through.  Things like relative
     * hostnames are allowed by the standards, but probably aren't wise.  Conversely,
     * null paths aren't allowed per RFC 2616 (should be '/' instead), but are allowed
     * by this function.
     *
     * This function only works for fully-qualified URIs.  /bob.html won't work.
     * See RFC 3986 for the appropriate method to turn a relative URI into an absolute
     * one given its context.
     *
     * Returns the untainted URI if the test value appears to be well-formed.
     *
     * Note that you probably want to either call this in combo with is_https_uri(). i.e.
     * if(isHttpUri(uri) || isHttpsUri(uri)) console.log('Good');
     * or use the convenience method isWebUri which is equivalent.
     *
     * @Arguments
     *   value  The potential URI to test.
     *
     * @Returns The untainted RFC 3986 URI on success, undefined on failure.
     * @Notes
     * This function does not make any attempt to check whether the URI is accessible
     * or 'makes sense' in any meaningful way.  It just checks that it is formatted
     * correctly.
     */
    export function isHttpUri(value: string): boolean;

    /*
     * @Function isHttpsUri(value)
     * @Synopsis   is the value a well-formed HTTPS uri?
     * @Description
     * See is_http_uri() for details.  This version only likes the https URI scheme.
     * Otherwise it's identical to is_http_uri()
     * @Arguments
     *   value  The potential URI to test.
     *
     * @Returns The untainted RFC 3986 URI on success, undefined on failure.
     * @Notes
     * This function does not make any attempt to check whether the URI is accessible
     * or 'makes sense' in any meaningful way.  It just checks that it is formatted
     * correctly.
     */
    export function isHttpsUri(value: string): boolean;

    /*
     * @Function isWebUri(value)
     * @Synopsis   is the value a well-formed HTTP or HTTPS uri?
     * @Description
     * This is just a convenience method that combines isHttpUri and isHttpsUri
     * to accept most common real-world URLs.
     * @Arguments
     *   value  The potential URI to test.
     *
     * @Returns The untainted RFC 3986 URI on success, undefined on failure.
     * @Notes
     * This function does not make any attempt to check whether the URI is accessible
     * or 'makes sense' in any meaningful way.  It just checks that it is formatted
     * correctly.
     */
    export function isWebUri(value: string): boolean;
}