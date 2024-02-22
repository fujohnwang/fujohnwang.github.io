

final class build$_ {
def args = build_sc.args$
def scriptPath = """build.sc"""
/*<script>*/
//> using dep "commons-io:commons-io:2.6"
//> using dep "org.apache.commons:commons-lang3:3.7"
//> using dep "net.java.dev.rome:rome:1.0.0"
//> using dep "org.slf4j:slf4j-api:1.7.7"
//> using dep "ch.qos.logback:logback-core:1.1.2"
//> using dep "ch.qos.logback:logback-classic:1.1.2"
//> using dep "com.github.dfabulich:sitemapgen4j:1.1.2"
//> using dep "org.jsoup:jsoup:1.17.2"

// import $ivy.`commons-io:commons-io:2.6`
// import $ivy.`org.apache.commons:commons-lang3:3.7`
// import $ivy.`net.java.dev.rome:rome:1.0.0`
// import $ivy.`org.slf4j:slf4j-api:1.7.7`
// import $ivy.`ch.qos.logback:logback-core:1.1.2`
// import $ivy.`ch.qos.logback:logback-classic:1.1.2`
// import $ivy.`com.github.dfabulich:sitemapgen4j:1.1.2`
// import $ivy.`org.jsoup:jsoup:1.17.2`


import java.io._
import java.util
import java.util.{Collections, Comparator}

import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import org.apache.commons.io.FileUtils
import org.apache.commons.lang3.StringUtils
import org.apache.commons.lang3.time.DateUtils
import org.slf4j.LoggerFactory
import org.jsoup.Jsoup
import scala.collection.JavaConverters._

import com.redfin.sitemapgenerator._

val logger = LoggerFactory.getLogger("site builder")
val encoding = "UTF-8"
val pageSize: Int = 11
val paginationDirectory = new File("pages")
val postsDir = "posts"
val baseUrl = "https://afoo.me"

def paginate(currentPageNumber: Int, pageCount: Int) = {
val previousLink = if (currentPageNumber - 1 >= 1) s"/pages/p${currentPageNumber - 1}.html" else "#"
val nextLink = if (currentPageNumber + 1 <= pageCount) s"/pages/p${currentPageNumber + 1}.html" else "#"

s"""
   |  <hr>
   |  <div style="text-align: center;">
   |				<a href="$previousLink" style="margin-right:1rem;">⇐ 更新鲜(Newer)</a>
   |				<a href="$nextLink" style="margin-left:1rem;">更早些时候(Older) ⇒</a>
   |	</div>
""".stripMargin
}

var files = FileUtils.listFiles(new File(postsDir), Array("html"), false)

val fileList: java.util.List[File] = new util.ArrayList[File]()
fileList.addAll(files)

Collections.sort(fileList, (o1: File, o2: File) => o1.getName.compareTo(o2.getName))
logger.info("postFile count={}", fileList.size)

val postFiles = fileList.asScala.reverse

if (!paginationDirectory.exists()) FileUtils.forceMkdir(paginationDirectory) else FileUtils.cleanDirectory(paginationDirectory)

val siteMapGenerator = new WebSitemapGenerator(baseUrl, new File("."))

var pageNumber = 1
val postGroups = postFiles.grouped(pageSize)
val pageCount = (postFiles.size / pageSize) + 1 // can't call size() on grouped result, since it will not work for the result iterator
logger.info("page count after group: {}", pageCount)
while (postGroups.hasNext) {
  val posts = postGroups.next()
  val tuples = posts.map(postFile => {
    val title = StringUtils.substringBeforeLast(StringUtils.substringBetween(scala.io.Source.fromFile(postFile, encoding).getLines().mkString("\r\n"), "<title>", "</title>"), "-")
    val fileName = postFile.getName
    val postDate = StringUtils.substring(fileName, 0, 10)
    siteMapGenerator.addUrl(s"$baseUrl/$postsDir/$fileName")
    (title, fileName, postDate)
  })

  val pageContent = tuples.foldLeft("")((index, tuple) => {
    val block =
      s"""
         |	<div>
         |		<small>${tuple._3}</small>
         |		<h2 style="margin-top:1rem; margin-bottom:3rem;"><a href="/posts/${tuple._2}">${tuple._1}</a></h2>
         |	</div>
       """.stripMargin

    index ++ block
  })

  val pageFile = new File(paginationDirectory, s"p${pageNumber}.html")
  val pagination = paginate(pageNumber, pageCount)

  val pageTemplate = StringUtils.replace(FileUtils.readFileToString(new File("templates/index.html"), encoding), "%s", pageContent + pagination)
  FileUtils.writeStringToFile(pageFile, pageTemplate, encoding)

  if (pageNumber == 1) {
    // create index.html
    FileUtils.writeStringToFile(new File("posts.html"), pageTemplate, encoding)
    // FileUtils.writeStringToFile(new File("index.html"), pageTemplate, encoding)
    // generate feeds
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0") // (rss_0.90, rss_0.91, rss_0.92, rss_0.93, rss_0.94, rss_1.0 rss_2.0 or atom_0.3)
    feed.setTitle("王福强的个人博客：一个架构士的思考与沉淀")
    feed.setLink("http://afoo.me")
    feed.setDescription("王福强的个人博客：一个架构士的思考与沉淀")

    val feeds = new util.ArrayList[SyndEntry]
    for (t <- tuples) {
      val entry = new SyndEntryImpl
      entry.setTitle(t._1)
      entry.setLink(s"http://afoo.me/posts/${t._2}")
      entry.setPublishedDate(DateUtils.parseDate(t._3, "yyyy-MM-dd"))
      val c = new SyndContentImpl()
      c.setType("text/html")
      c.setValue(FileUtils.readFileToString(new File(postsDir, t._2), encoding))
      entry.setDescription(c)

      feeds.add(entry)
    }
    feed.setEntries(feeds)
    val writer = new BufferedWriter(new FileWriter("feeds.xml"))
    val output = new SyndFeedOutput()
    try {
      output.output(feed, writer)
    } finally {
      writer.close()
    }
  }
  pageNumber = pageNumber + 1
}


siteMapGenerator.addUrl("https://afoo.me/whoami.html")
siteMapGenerator.addUrl("https://afoo.me/books.html")
siteMapGenerator.addUrl("https://afoo.me/feeds.xml")
siteMapGenerator.addUrl("https://afoo.me/columns.html")
siteMapGenerator.addUrl("https://afoo.me/favorite.html")
siteMapGenerator.addUrl("https://afoo.me/keewords/index.html")
siteMapGenerator.addUrl("https://afoo.me/dashboard.html")
siteMapGenerator.addUrl("https://afoo.me/references.html")
siteMapGenerator.addUrl("https://afoo.me/interlinks.html")
siteMapGenerator.addUrl("https://afoo.me/crosslinks.html")
siteMapGenerator.addUrl("https://afoo.me/fw.html")
siteMapGenerator.addUrl("https://afoo.me/tools.html")
siteMapGenerator.write()


// fetch latest 3 post entries and write into index.html
val indexFile = new File("index.html")
val indexPageContent = FileUtils.readFileToString(indexFile, encoding)
val html = Jsoup.parse(indexPageContent)
val div = html.select("div#latest_posts").first()


val postListElements = Jsoup.parse(new File("posts.html"), encoding).select("main  h1 ~ div")
val sb = new StringBuilder()
if (postListElements.size() < 3) {
  (0 until (postListElements.size())).foreach(i => sb.append(postListElements.get(i)))
} else {
  sb.append(postListElements.get(0)).append(postListElements.get(1)).append(postListElements.get(2))
}

div.html(sb.toString())

FileUtils.writeStringToFile(indexFile, html.toString, encoding, false)





/*</script>*/ /*<generated>*//*</generated>*/
}

object build_sc {
  private var args$opt0 = Option.empty[Array[String]]
  def args$set(args: Array[String]): Unit = {
    args$opt0 = Some(args)
  }
  def args$opt: Option[Array[String]] = args$opt0
  def args$: Array[String] = args$opt.getOrElse {
    sys.error("No arguments passed to this script")
  }

  lazy val script = new build$_

  def main(args: Array[String]): Unit = {
    args$set(args)
    val _ = script.hashCode() // hashCode to clear scalac warning about pure expression in statement position
  }
}

export build_sc.script as `build`

