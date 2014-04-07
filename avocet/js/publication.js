/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core'], function($, oae) {

    // Get the publication id from the URL. The expected URL is `/publications/<tenantId>/<publicationId>`.
    // The publication id will then be `p:<tenantId>/<publicationId>`
    // e.g. publication/cam/xkVkSpFJo
    var publicationId = 'p:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested content profile
    var publicationProfile = null;

    var getPublicationProfile = function() {
        oae.api.publication.getPublication(publicationId, function(err, publication) {
            // Cache the publication profile data
            publicationProfile = publication;
            // Set the browser title
            oae.api.util.setBrowserTitle(publicationProfile.displayName);
            // Render the submission info
            renderSubmissionInfo();
            // Render the file info
            renderFileInfo();
            // Initialise the form
            initForm();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Converts a Number to a String and adds padding if the number is lower than 10.
     *
     * @param  {Number}   nr  The number to add padding to
     * @return {String}       The number converted to a string which is at least 2 characters long
     */
    var zeroPadding = function(nr) {
        return nr < 10 ? '0' + nr : String(nr);
    };

    /**
     * Renders the submission info template
     */
    var renderSubmissionInfo = function() {
        var receivedDate = new Date(publicationProfile.date);
        var day = zeroPadding(receivedDate.getDate());
        var month = zeroPadding(receivedDate.getMonth() + 1);
        var year = receivedDate.getFullYear();
        oae.api.util.template().render($('#oa-submissioninfo-template'), {
            'receivedDate': day + '/' + month + '/' + year
        }, $('#oa-submissioninfo-container'));
    };

    /**
     * Renders the file info template
     */
    var renderFileInfo = function() {
        oae.api.util.template().render($('#oa-fileinfo-template'), {
            'fileName': publicationProfile.linkedContent.filename,
            'fileSize': $.fn.fileSize(publicationProfile.linkedContent.size),
        }, $('#oa-fileinfo-container'));
    };

    /**
     * Maps publication data to a structure which the form can understand.
     *
     * @param  {Object}  publication  A publication returned from the API
     * @return {Object}               Reorganized publication data
     */
    var publicationDataToFormData = function(publication) {
        return {
            'title': publication.displayName,
            'author': publication.authors[0],
            'email': publication.contactEmail,
            'journal': publication.journalName
        };
    };

    /**
     * Initialises the form
     */
    var initForm = function() {
        // Fetch and insert the publicationform widget
        oae.api.widget.insertWidget('publicationform', null, $('#oa-publicationform-container'), null, {
            'prefill': publicationDataToFormData(publicationProfile),
            'disabled': true
        });
    };

    getPublicationProfile();
});