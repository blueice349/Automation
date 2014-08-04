/* C++ code produced by gperf version 3.0.3 */
/* Command-line: gperf -L C++ -E -t /private/var/folders/vt/dbsypb5565b_thjmy1z957q00000gn/T/chris/imagefactory-generated/KrollGeneratedBindings.gperf  */
/* Computed positions: -k'' */

#line 3 "/private/var/folders/vt/dbsypb5565b_thjmy1z957q00000gn/T/chris/imagefactory-generated/KrollGeneratedBindings.gperf"


#include <string.h>
#include <v8.h>
#include <KrollBindings.h>

#include "ti.imagefactory.ImageFactoryModule.h"


#line 13 "/private/var/folders/vt/dbsypb5565b_thjmy1z957q00000gn/T/chris/imagefactory-generated/KrollGeneratedBindings.gperf"
struct titanium::bindings::BindEntry;
/* maximum key range = 1, duplicates = 0 */

class ImageFactoryBindings
{
private:
  static inline unsigned int hash (const char *str, unsigned int len);
public:
  static struct titanium::bindings::BindEntry *lookupGeneratedInit (const char *str, unsigned int len);
};

inline /*ARGSUSED*/
unsigned int
ImageFactoryBindings::hash (register const char *str, register unsigned int len)
{
  return len;
}

struct titanium::bindings::BindEntry *
ImageFactoryBindings::lookupGeneratedInit (register const char *str, register unsigned int len)
{
  enum
    {
      TOTAL_KEYWORDS = 1,
      MIN_WORD_LENGTH = 34,
      MAX_WORD_LENGTH = 34,
      MIN_HASH_VALUE = 34,
      MAX_HASH_VALUE = 34
    };

  static struct titanium::bindings::BindEntry wordlist[] =
    {
      {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""},
      {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""},
      {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""}, {""},
      {""}, {""}, {""}, {""}, {""}, {""}, {""},
#line 15 "/private/var/folders/vt/dbsypb5565b_thjmy1z957q00000gn/T/chris/imagefactory-generated/KrollGeneratedBindings.gperf"
      {"ti.imagefactory.ImageFactoryModule", ::ti::imagefactory::ImageFactoryModule::bindProxy, ::ti::imagefactory::ImageFactoryModule::dispose}
    };

  if (len <= MAX_WORD_LENGTH && len >= MIN_WORD_LENGTH)
    {
      register int key = hash (str, len);

      if (key <= MAX_HASH_VALUE && key >= 0)
        {
          register const char *s = wordlist[key].name;

          if (*str == *s && !strcmp (str + 1, s + 1))
            return &wordlist[key];
        }
    }
  return 0;
}
#line 16 "/private/var/folders/vt/dbsypb5565b_thjmy1z957q00000gn/T/chris/imagefactory-generated/KrollGeneratedBindings.gperf"

